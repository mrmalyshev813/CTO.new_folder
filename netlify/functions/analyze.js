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

function normalizeUrl(url) {
  console.log('🔍 Normalizing URL:', url);
  
  try {
    // Remove whitespace
    url = url.trim();
    
    // Add https:// if no protocol is present
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
      console.log('✅ Added https:// prefix');
    }
    
    // Validate URL format
    const urlObj = new URL(url);
    console.log('✅ URL is valid:', urlObj.href);
    
    return {
      url: urlObj.href,
      success: true,
      error: null
    };
  } catch (error) {
    console.error('❌ URL normalization failed:', error.message);
    return {
      url: null,
      success: false,
      error: `Invalid URL format: ${error.message}`
    };
  }
}

async function crawlWebsite(url) {
  console.log('🔍 Starting website crawl for:', url);
  
  let browser = null;
  try {
    // Normalize and validate URL
    const normalizeResult = normalizeUrl(url);
    if (!normalizeResult.success) {
      throw new Error(normalizeResult.error);
    }
    url = normalizeResult.url;
    
    console.log('🚀 Launching browser...');
    const executablePath = await chromium.executablePath();
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath ?? undefined,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    console.log('✅ Browser launched successfully');
    console.log('📄 Creating new page...');
    
    const page = await browser.newPage();
    
    console.log('🌐 Navigating to URL:', url);
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 20000 
    });

    console.log('✅ Page loaded successfully');
    
    // Wait a bit for dynamic content to load
    console.log('⏳ Waiting for dynamic content...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('📸 Taking screenshot...');
    
    const screenshotBuffer = await page.screenshot({ 
      fullPage: true, 
      type: 'png' 
    });
    
    console.log('✅ Screenshot captured');
    console.log('📄 Extracting HTML content...');
    
    const htmlContent = await page.content();

    console.log(`✅ HTML extracted (${htmlContent.length} characters)`);
    console.log('🔒 Closing browser...');
    
    await browser.close();
    console.log('✅ Browser closed');

    const $ = cheerio.load(htmlContent);
    const cleanedHtml = $.html();

    console.log('✅ Website crawl completed successfully');

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
        console.log('🔒 Browser closed after error');
      } catch (closeErr) {
        console.warn('⚠️ Failed to close browser after error:', closeErr.message);
      }
    }

    console.error('❌ crawlWebsite failed for:', url);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return {
      screenshot: null,
      html: null,
      success: false,
      error: getFriendlyCrawlError(error)
    };
  }
}

async function analyzeWithAI(url, htmlContent) {
  console.log('🤖 Starting AI analysis for:', url);
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log('✅ OpenAI client initialized');

    const htmlSnippet = htmlContent.length > 5000 
      ? htmlContent.substring(0, 5000) 
      : htmlContent;

    console.log(`📄 HTML snippet length: ${htmlSnippet.length} characters`);

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

Return a JSON object with a "zones" array containing objects with this exact format:
{
  "zones": [
    {"zone": "Header", "priority": "high"},
    {"zone": "Sidebar", "priority": "medium"}
  ]
}

Important: Only include zones that actually exist on the website. Do not include all zones by default.
Return ONLY valid JSON, no additional text or explanation.`;

    console.log('📡 Calling OpenAI API...');

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
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500
    });

    console.log('✅ OpenAI API response received');

    let content = response.choices[0].message.content.trim();
    console.log('📥 Raw AI response:', content.substring(0, 200) + '...');

    // Clean up markdown code blocks if present
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

    console.log('🧹 Cleaned AI response:', content.substring(0, 200) + '...');

    let parsedData;
    try {
      parsedData = JSON.parse(content);
      console.log('✅ Successfully parsed JSON response');
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError.message);
      console.error('❌ Failed content:', content);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    // Handle both array and object formats
    let zones;
    if (Array.isArray(parsedData)) {
      zones = parsedData;
    } else if (parsedData.zones && Array.isArray(parsedData.zones)) {
      zones = parsedData.zones;
    } else {
      throw new Error('AI response does not contain a valid zones array');
    }

    console.log(`✅ Found ${zones.length} zones`);

    // Validate zone format
    for (const zone of zones) {
      if (!zone.zone || !zone.priority) {
        console.error('❌ Invalid zone format:', zone);
        throw new Error('Invalid zone format in AI response');
      }
    }

    console.log('✅ AI analysis completed successfully');

    return {
      zones,
      success: true,
      error: null
    };
  } catch (error) {
    console.error('❌ Error in analyzeWithAI:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

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
    } catch {
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
    } catch {
      // Directory might already exist
    }
    
    const filePath = path.join(tmpDir, `${analysisId}.pdf`);
    
    return new Promise((resolve, _reject) => {
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

exports.handler = async (event, _context) => {
  console.log('🚀 Analyze function called');
  console.log('HTTP Method:', event.httpMethod);
  
  if (event.httpMethod !== 'POST') {
    console.log('❌ Invalid HTTP method');
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📥 Parsing request body...');
    const { url } = JSON.parse(event.body);

    if (!url) {
      console.log('❌ URL is missing from request');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    console.log('✅ Request validated, URL:', url);
    console.log('==========================================');
    console.log('STEP 1: Crawling website');
    console.log('==========================================');

    const crawlResult = await crawlWebsite(url);

    if (!crawlResult.success) {
      console.log('❌ Crawl failed:', crawlResult.error);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: `Failed to crawl website: ${crawlResult.error}` 
        })
      };
    }

    console.log('✅ Crawl completed successfully');
    console.log('==========================================');
    console.log('STEP 2: Analyzing with AI');
    console.log('==========================================');

    const aiResult = await analyzeWithAI(url, crawlResult.html);

    if (!aiResult.success) {
      console.log('❌ AI analysis failed:', aiResult.error);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: `Failed to analyze website: ${aiResult.error}` 
        })
      };
    }

    console.log('✅ AI analysis completed successfully');
    console.log('==========================================');
    console.log('STEP 3: Generating proposal');
    console.log('==========================================');

    const proposalText = generateProposal(url, aiResult.zones);
    const analysisId = uuidv4();

    console.log('✅ Proposal generated, Analysis ID:', analysisId);

    analysisCache.set(analysisId, {
      url,
      zones: aiResult.zones,
      proposalText,
      screenshot: crawlResult.screenshot
    });

    console.log('✅ Result cached');
    console.log('==========================================');
    console.log('STEP 4: Creating export files');
    console.log('==========================================');

    const docxResult = await createDOCX(proposalText, analysisId);
    const pdfResult = await createPDF(proposalText, analysisId);

    if (docxResult.success) {
      console.log('✅ DOCX file created');
    } else {
      console.log('⚠️ DOCX creation failed:', docxResult.error);
    }

    if (pdfResult.success) {
      console.log('✅ PDF file created');
    } else {
      console.log('⚠️ PDF creation failed:', pdfResult.error);
    }

    console.log('==========================================');
    console.log('✅ Analysis complete!');
    console.log('==========================================');

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
    console.error('❌ Error in analyze function:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: `Internal server error: ${error.message}` 
      })
    };
  }
};
