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

    const htmlSnippet = htmlContent.length > 5000 
      ? htmlContent.substring(0, 5000) 
      : htmlContent;

    const prompt = `You are an expert in web advertising and ad placement optimization.

Analyze the following website: ${url}

HTML structure (snippet):
${htmlSnippet}

Identify the optimal ad placement zones on this website. For each zone, assign a priority level.

Available zones:
- Header: Top of the page, navigation area
- Sidebar: Left or right sidebar areas
- Content: Within the main content area
- Footer: Bottom of the page
- Popup: Overlay or modal opportunities

For each zone you identify as present and suitable for ads, assign one of these priorities:
- high: Highly visible, high engagement potential
- medium: Moderate visibility and engagement
- low: Present but less optimal

Return ONLY a JSON array with this exact format:
[
  {"zone": "Header", "priority": "high"},
  {"zone": "Sidebar", "priority": "medium"},
  ...
]

Important: Only include zones that actually exist on the website. Do not include all zones by default.
Return ONLY the JSON array, no additional text or explanation.`;

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
      max_tokens: 500
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

    const zones = JSON.parse(content);

    if (!Array.isArray(zones)) {
      throw new Error('AI response is not an array');
    }

    for (const zone of zones) {
      if (!zone.zone || !zone.priority) {
        throw new Error('Invalid zone format in AI response');
      }
    }

    return {
      zones,
      success: true,
      error: null
    };
  } catch (error) {
    return {
      zones: [],
      success: false,
      error: error.message
    };
  }
}

function generateProposal(url, zones) {
  const proposalLines = [
    `Subject: Предложение по рекламе на сайте ${url}`,
    '',
    'Здравствуйте!',
    '',
    `Прежде всего хочу поздравить вас с успешным развитием вашего ресурса. ${url} привлекает широкую аудиторию. Мы в Adlook уверены, что грамотное размещение рекламы позволит значительно увеличить доход.`,
    '',
    'Немного о нас: Adlook — это российская SSP-платформа (Supply-Side Platform), основанная в 2018 году в Санкт-Петербурге. Мы помогаем владельцам сайтов монетизировать свои ресурсы.',
    '',
    'Мы проанализировали ваш сайт и выделили несколько эффективных зон:'
  ];

  const priorityZones = zones.filter(z => 
    ['high', 'medium', 'low'].includes(z.priority)
  );

  if (priorityZones.length > 0) {
    priorityZones.forEach((zone, idx) => {
      proposalLines.push(`${idx + 1}. ${zone.zone} – ${zone.priority} level`);
    });
  } else {
    proposalLines.push('Не удалось определить конкретные зоны.');
  }

  proposalLines.push(
    '',
    'Потенциальный доход: от 50,000 до 150,000 рублей в месяц.',
    '',
    'Что мы предлагаем:',
    '- Сроки размещения: от одного месяца',
    '- Форматы: баннеры, контекстная реклама, всплывающие окна',
    '- Программная настройка рекламы под ваш сайт',
    '',
    'С уважением,',
    'Менеджер по работе с партнёрами, Adlook'
  );

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

    const proposalText = generateProposal(url, aiResult.zones);
    const analysisId = uuidv4();

    analysisCache.set(analysisId, {
      url,
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
