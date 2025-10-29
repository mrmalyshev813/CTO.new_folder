const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const { OpenAI } = require('openai');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const PDFDocument = require('pdfkit');

const analysisCache = new Map();

function getFriendlyCrawlError(error) {
  const message = (error && error.message) ? error.message : '';
  if (!message) {
    return 'We were unable to load the website. Please try again with a valid URL.';
  }

  const normalized = message.toLowerCase();

  if (normalized.includes('timeout')) {
    return 'Navigation timed out while loading the website. Please try again in a moment or choose a lighter page.';
  }

  if (normalized.includes('err_name_not_resolved') || normalized.includes('enotfound') || normalized.includes('dns')) {
    return 'We could not resolve that domain. Please confirm the URL is correct and publicly accessible.';
  }

  if (normalized.includes('invalid url') || normalized.includes('protocol error: url') || normalized.includes('url is not valid')) {
    return 'The URL appears to be invalid. Please include the full address starting with http:// or https://';
  }

  if (normalized.includes('err_connection_refused') || normalized.includes('err_connection_timed_out') || normalized.includes('failed to fetch')) {
    return 'We were unable to reach the website. The server may be offline or blocking requests.';
  }

  if (normalized.includes('libnss3.so') || normalized.includes('dependencies')) {
    return 'Chromium dependencies are missing in this environment. Please ensure all required system packages are installed.';
  }

  return 'We were unable to load the website. Please try again or use a different URL.';
}

async function crawlWebsite(url) {
  let browser = null;
  try {
    const executablePath = await chromium.executablePath();
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath ?? undefined,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });

    const screenshotBuffer = await page.screenshot({ 
      fullPage: true, 
      type: 'png' 
    });
    const htmlContent = await page.content();

    await browser.close();

    const $ = cheerio.load(htmlContent);
    const cleanedHtml = $.html();

    return {
      screenshot: screenshotBuffer,
      html: cleanedHtml,
      success: true,
      error: null
    };
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.warn('Failed to close browser after error:', closeErr.message);
      }
    }

    console.error(`crawlWebsite failed for ${url}:`, error);

    return {
      screenshot: null,
      html: null,
      success: false,
      error: getFriendlyCrawlError(error)
    };
  }
}

async function analyzeWithAI(url, htmlContent) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const htmlSnippet = htmlContent.length > 8000 
      ? htmlContent.substring(0, 8000) 
      : htmlContent;

    const prompt = `You are an expert in web advertising and ad placement optimization.

Analyze the following website: ${url}

HTML structure (snippet):
${htmlSnippet}

Perform a comprehensive analysis and provide the following information:

1. SITE TYPE: Determine the category of the website (e.g., news portal, e-commerce, blog, corporate site, forum, entertainment, educational, etc.)

2. TRAFFIC ESTIMATE: Based on the site's structure, content volume, and complexity, provide a rough traffic estimate category:
   - low: Small site, likely under 1000 visitors/day
   - medium: Medium-sized site, 1000-10000 visitors/day
   - high: Large site with rich content, 10000-100000 visitors/day
   - very_high: Major site, likely over 100000 visitors/day

3. AD OCCUPANCY: Analyze if the site already has advertising placements. Look for:
   - Ad networks (Google AdSense, Yandex.Direct, etc.)
   - Banner placeholders or ad slots
   - Affiliate links
   - Sponsored content markers
   For each zone, indicate if it's "occupied" (already has ads) or "free" (available for ads)

4. AD PLACEMENT ZONES: Identify optimal ad placement zones on this website. For each zone:
   - Name the zone (Header, Sidebar, Content, Footer, Popup)
   - Assign priority (high, medium, low)
   - Indicate occupancy status (occupied or free)
   - Provide a brief reason why this zone is good for ads

Return ONLY a JSON object with this exact format:
{
  "siteType": "news portal",
  "trafficEstimate": "high",
  "zones": [
    {
      "zone": "Header",
      "priority": "high",
      "occupancy": "free",
      "reason": "Prime visibility, first thing users see"
    },
    {
      "zone": "Sidebar",
      "priority": "medium",
      "occupancy": "occupied",
      "reason": "Good visibility but already has Google AdSense"
    }
  ]
}

Important: Only include zones that actually exist on the website. Provide realistic analysis based on the HTML content.
Return ONLY the JSON object, no additional text or explanation.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert web advertising analyst. Always respond with valid JSON only.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    let content = response.choices[0].message.content.trim();

    if (content.startsWith('```json')) {
      content = content.substring(7);
    }
    if (content.startsWith('```')) {
      content = content.substring(3);
    }
    if (content.endsWith('```')) {
      content = content.slice(0, -3);
    }
    content = content.trim();

    const analysis = JSON.parse(content);

    if (!analysis.zones || !Array.isArray(analysis.zones)) {
      throw new Error('AI response does not contain valid zones array');
    }

    for (const zone of analysis.zones) {
      if (!zone.zone || !zone.priority || !zone.occupancy) {
        throw new Error('Invalid zone format in AI response');
      }
    }

    return {
      siteType: analysis.siteType || 'unknown',
      trafficEstimate: analysis.trafficEstimate || 'medium',
      zones: analysis.zones,
      success: true,
      error: null
    };
  } catch (error) {
    return {
      siteType: 'unknown',
      trafficEstimate: 'medium',
      zones: [],
      success: false,
      error: error.message
    };
  }
}

function generateProposal(url, siteType, trafficEstimate, zones) {
  const proposalLines = [
    `Subject: Увеличьте доход от ${url} с Adlook - индивидуальное предложение`,
    '',
    'Здравствуйте!',
    ''
  ];

  const siteTypeDescriptions = {
    'news portal': 'новостного портала',
    'news': 'новостного портала',
    'e-commerce': 'интернет-магазина',
    'blog': 'блога',
    'corporate site': 'корпоративного сайта',
    'corporate': 'корпоративного сайта',
    'forum': 'форума',
    'entertainment': 'развлекательного ресурса',
    'educational': 'образовательного портала',
    'magazine': 'онлайн-журнала',
    'media': 'медиа-ресурса'
  };

  const siteTypeRu = siteTypeDescriptions[siteType.toLowerCase()] || 'веб-ресурса';

  const trafficDescriptions = {
    'low': 'стабильной аудиторией',
    'medium': 'активной аудиторией',
    'high': 'внушительным трафиком',
    'very_high': 'огромной аудиторией'
  };

  const trafficDesc = trafficDescriptions[trafficEstimate] || 'растущей аудиторией';

  proposalLines.push(
    `Я изучил ваш проект ${url} и был впечатлен! Вижу, что у вас качественный ${siteTypeRu} с ${trafficDesc}. Это отличная база для масштабирования монетизации.`
  );
  proposalLines.push('');

  const freeZones = zones.filter(z => z.occupancy === 'free');
  const occupiedZones = zones.filter(z => z.occupancy === 'occupied');

  if (occupiedZones.length > 0) {
    proposalLines.push(
      `Я заметил, что у вас уже есть реклама на сайте. Это хорошо - значит, вы уже монетизируете трафик. Однако мы можем помочь увеличить доход на 30-50% за счёт оптимизации существующих мест и использования свободных зон.`
    );
    proposalLines.push('');
  }

  proposalLines.push(
    'Немного о нас: Adlook — это российская SSP-платформа (Supply-Side Platform), основанная в 2018 году в Санкт-Петербурге. Мы помогаем владельцам сайтов монетизировать свои ресурсы через прямую интеграцию с крупнейшими рекламодателями.'
  );
  proposalLines.push('');

  proposalLines.push('Результаты анализа вашего сайта:');
  proposalLines.push('');

  if (freeZones.length > 0) {
    proposalLines.push('ДОСТУПНЫЕ ЗОНЫ ДЛЯ РАЗМЕЩЕНИЯ (свободны):');
    freeZones.forEach((zone, idx) => {
      const priorityRu = {
        'high': 'высокий приоритет',
        'medium': 'средний приоритет',
        'low': 'низкий приоритет'
      }[zone.priority] || zone.priority;
      
      proposalLines.push(`${idx + 1}. ${zone.zone} (${priorityRu})`);
      if (zone.reason) {
        proposalLines.push(`   ${zone.reason}`);
      }
    });
    proposalLines.push('');
  }

  if (occupiedZones.length > 0) {
    proposalLines.push('ЗАНЯТЫЕ ЗОНЫ (требуют оптимизации):');
    occupiedZones.forEach((zone, idx) => {
      const priorityRu = {
        'high': 'высокий приоритет',
        'medium': 'средний приоритет',
        'low': 'низкий приоритет'
      }[zone.priority] || zone.priority;
      
      proposalLines.push(`${idx + 1}. ${zone.zone} (${priorityRu})`);
      if (zone.reason) {
        proposalLines.push(`   ${zone.reason}`);
      }
    });
    proposalLines.push('');
  }

  const revenueEstimates = {
    'low': { min: 20000, max: 60000 },
    'medium': { min: 50000, max: 150000 },
    'high': { min: 150000, max: 500000 },
    'very_high': { min: 500000, max: 2000000 }
  };

  const revenue = revenueEstimates[trafficEstimate] || revenueEstimates['medium'];

  proposalLines.push('ВАШИ ВЫГОДЫ ОТ СОТРУДНИЧЕСТВА С ADLOOK:');
  proposalLines.push('');
  proposalLines.push(`1. УВЕЛИЧЕНИЕ ДОХОДА: от ${revenue.min.toLocaleString('ru-RU')} до ${revenue.max.toLocaleString('ru-RU')} рублей в месяц`);
  
  if (occupiedZones.length > 0) {
    proposalLines.push('   Даже при наличии текущей рекламы, мы увеличим доход на 30-50% благодаря:');
    proposalLines.push('   - Прямым контрактам с премиум-рекламодателями');
    proposalLines.push('   - Более высоким ставкам за показы и клики');
    proposalLines.push('   - Оптимизации существующих размещений');
  } else {
    proposalLines.push('   Вы получите стабильный пассивный доход без изменения контента сайта');
  }
  
  proposalLines.push('');
  proposalLines.push('2. БЫСТРЫЙ СТАРТ: интеграция за 1 день');
  proposalLines.push('   - Мы сами установим рекламный код');
  proposalLines.push('   - Настроим оптимальные форматы под ваш дизайн');
  proposalLines.push('   - Первые выплаты уже через 2 недели');
  proposalLines.push('');
  proposalLines.push('3. СОХРАНЕНИЕ ПОЛЬЗОВАТЕЛЬСКОГО ОПЫТА:');
  proposalLines.push('   - Реклама не будет раздражать посетителей');
  proposalLines.push('   - Адаптивные форматы под мобильные устройства');
  proposalLines.push('   - Контроль над тематикой рекламы');
  proposalLines.push('');
  proposalLines.push('4. ПРОЗРАЧНОСТЬ И КОНТРОЛЬ:');
  proposalLines.push('   - Личный кабинет с детальной статистикой в реальном времени');
  proposalLines.push('   - Еженедельные отчёты о доходах');
  proposalLines.push('   - Выплаты два раза в месяц, без задержек');
  proposalLines.push('');
  
  if (siteType.toLowerCase().includes('news') || siteType.toLowerCase().includes('media')) {
    proposalLines.push('5. СПЕЦИАЛЬНЫЕ УСЛОВИЯ ДЛЯ НОВОСТНЫХ РЕСУРСОВ:');
    proposalLines.push('   - Премиум-рекламодатели, готовые платить больше за новостную аудиторию');
    proposalLines.push('   - Нативные форматы, органично вписывающиеся в контент');
  } else if (siteType.toLowerCase().includes('commerce')) {
    proposalLines.push('5. СПЕЦИАЛЬНЫЕ УСЛОВИЯ ДЛЯ E-COMMERCE:');
    proposalLines.push('   - Товарные рекомендации с высокой конверсией');
    proposalLines.push('   - Динамические баннеры на основе поведения пользователей');
  } else if (siteType.toLowerCase().includes('blog')) {
    proposalLines.push('5. СПЕЦИАЛЬНЫЕ УСЛОВИЯ ДЛЯ БЛОГОВ:');
    proposalLines.push('   - Нативная реклама в стиле ваших статей');
    proposalLines.push('   - Брендированный контент от надёжных рекламодателей');
  }
  
  proposalLines.push('');
  proposalLines.push('ФОРМАТЫ РАЗМЕЩЕНИЯ:');
  proposalLines.push('- Баннеры (статичные и анимированные)');
  proposalLines.push('- Нативная реклама (встраивается в контент)');
  proposalLines.push('- Видео-реклама (для сайтов с высоким трафиком)');
  proposalLines.push('- Rich-media форматы (интерактивные объявления)');
  proposalLines.push('');
  proposalLines.push('Готов обсудить детали и ответить на ваши вопросы. Могу подготовить индивидуальный расчёт дохода с учётом специфики вашего проекта.');
  proposalLines.push('');
  proposalLines.push('Давайте созвонимся на этой неделе? Предложите удобное время.');
  proposalLines.push('');
  proposalLines.push('С уважением,');
  proposalLines.push('Менеджер по развитию партнёрств');
  proposalLines.push('Adlook');
  proposalLines.push('');
  proposalLines.push('P.S. Отвечу на письмо в течение 2 часов. Также можете позвонить или написать в Telegram для более быстрой связи.');

  return proposalLines.join('\n');
}

async function createDOCX(proposalText, analysisId) {
  try {
    const lines = proposalText.split('\n');
    const paragraphs = lines.map(line => {
      if (line.trim()) {
        return new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 22
            })
          ]
        });
      } else {
        return new Paragraph({
          children: [new TextRun({ text: '' })]
        });
      }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const tmpDir = '/tmp/adlook_exports';
    
    try {
      await fs.mkdir(tmpDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }
    
    const filePath = path.join(tmpDir, `${analysisId}.docx`);
    await fs.writeFile(filePath, buffer);

    return {
      path: filePath,
      success: true,
      error: null
    };
  } catch (error) {
    return {
      path: null,
      success: false,
      error: error.message
    };
  }
}

async function createPDF(proposalText, analysisId) {
  try {
    const tmpDir = '/tmp/adlook_exports';
    
    try {
      await fs.mkdir(tmpDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }
    
    const filePath = path.join(tmpDir, `${analysisId}.pdf`);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = require('fs').createWriteStream(filePath);

      doc.pipe(stream);

      doc.font('Helvetica');
      doc.fontSize(11);

      const lines = proposalText.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          doc.text(line, { lineGap: 4 });
        } else {
          doc.moveDown(0.5);
        }
      });

      doc.end();

      stream.on('finish', () => {
        resolve({
          path: filePath,
          success: true,
          error: null
        });
      });

      stream.on('error', (error) => {
        resolve({
          path: null,
          success: false,
          error: error.message
        });
      });
    });
  } catch (error) {
    return {
      path: null,
      success: false,
      error: error.message
    };
  }
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { url } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    const crawlResult = await crawlWebsite(url);

    if (!crawlResult.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: `Failed to crawl website: ${crawlResult.error}` 
        })
      };
    }

    const aiResult = await analyzeWithAI(url, crawlResult.html);

    if (!aiResult.success) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: `Failed to analyze website: ${aiResult.error}` 
        })
      };
    }

    const proposalText = generateProposal(url, aiResult.siteType, aiResult.trafficEstimate, aiResult.zones);
    const analysisId = uuidv4();

    analysisCache.set(analysisId, {
      url,
      siteType: aiResult.siteType,
      trafficEstimate: aiResult.trafficEstimate,
      zones: aiResult.zones,
      proposalText,
      screenshot: crawlResult.screenshot
    });

    const docxResult = await createDOCX(proposalText, analysisId);
    const pdfResult = await createPDF(proposalText, analysisId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        proposal_text: proposalText,
        site_type: aiResult.siteType,
        traffic_estimate: aiResult.trafficEstimate,
        zones: aiResult.zones,
        analysis_id: analysisId
      })
    };
  } catch (error) {
    console.error('Error in analyze function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: `Internal server error: ${error.message}` 
      })
    };
  }
};
