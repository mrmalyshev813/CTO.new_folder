const { chromium } = require('playwright');
const { OpenAI } = require('openai');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');

async function captureScreenshot(url) {
    console.log('📸 Capturing screenshot for:', url);
    
    let browser;
    try {
        // Launch browser
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage({
            viewport: { width: 1920, height: 1080 }
        });
        
        // Navigate with timeout
        await page.goto(url, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Take screenshot
        const screenshot = await page.screenshot({
            fullPage: true,
            type: 'png'
        });
        
        console.log('✅ Screenshot captured');
        
        // Convert to base64 for OpenAI
        const base64Screenshot = screenshot.toString('base64');
        return `data:image/png;base64,${base64Screenshot}`;
        
    } catch (error) {
        console.error('❌ Screenshot error:', error);
        throw new Error(`Не удалось создать скриншот: ${error.message}`);
    } finally {
        if (browser) await browser.close();
    }
}

async function analyzeScreenshotForAds(url, screenshotDataUrl) {
    console.log('🤖 Analyzing screenshot with OpenAI Vision...');
    
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
        throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o', // Supports vision
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Проанализируй скриншот сайта ${url} и определи рекламные возможности.

Визуально оцени где можно разместить рекламу:
1. Header (шапка сайта, навигация)
2. Sidebar (боковая панель справа или слева)  
3. Content (внутри контента, между блоками)
4. Footer (подвал сайта)
5. Popup (модальные окна)

Для каждой зоны укажи:
- name: название зоны
- available: true если место свободно, false если уже занято рекламой
- size: рекомендуемый размер баннера (например "728x90", "300x250")
- priority: "high" для самых заметных мест, "medium" для менее заметных
- description: подробное описание где именно находится зона и почему она подходит

ВАЖНО: Реально оценивай - есть ли свободное место или всё уже занято.

Верни JSON:
{
  "zones": [
    {
      "name": "Header",
      "available": true,
      "size": "728x90",
      "priority": "high",
      "description": "..."
    }
  ],
  "language": "ru" or "en" (определи язык сайта)
}`
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: screenshotDataUrl,
                            detail: 'high' // High detail for better analysis
                        }
                    }
                ]
            }],
            response_format: { type: 'json_object' },
            max_tokens: 2000
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message}`);
    }
    
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    console.log('✅ Vision analysis complete:', result);
    return result;
}

async function scrapeWebsiteData(url) {
    console.log('🔍 Scraping website data...');
    
    try {
        // Fetch website HTML using Playwright to get dynamic content
        let browser;
        try {
            browser = await chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            
            const page = await browser.newPage();
            await page.goto(url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            const html = await page.content();
            await browser.close();
            
            const $ = cheerio.load(html);
            
            // Extract emails
            const emails = [];
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            
            // Search in text content
            const text = $('body').text();
            const foundEmails = text.match(emailRegex) || [];
            emails.push(...foundEmails);
            
            // Search in mailto links
            $('a[href^="mailto:"]').each((i, el) => {
                const email = $(el).attr('href').replace('mailto:', '');
                emails.push(email);
            });
            
            // Extract company name
            let companyName = null;
            
            // Try meta tags
            companyName = $('meta[property="og:site_name"]').attr('content') ||
                          $('meta[name="author"]').attr('content') ||
                          $('title').text().split('|')[0].trim();
            
            // Try footer for Russian company formats
            if (!companyName) {
                const footerText = $('footer').text();
                const match = footerText.match(/(ООО|ИП|АО|ЗАО|ПАО)\s+["«]?([^"»\n]+)["»]?/);
                if (match) companyName = match[0];
            }
            
            console.log('✅ Found emails:', emails);
            console.log('✅ Found company:', companyName);
            
            return {
                emails: [...new Set(emails)].filter(e => e && e.includes('@')),
                companyName,
                title: $('title').text(),
                description: $('meta[name="description"]').attr('content')
            };
            
        } finally {
            if (browser) await browser.close();
        }
        
    } catch (error) {
        console.error('❌ Scraping error:', error);
        return { emails: [], companyName: null };
    }
}

async function researchCompanyOwner(companyName, websiteUrl) {
    console.log('🔎 Researching company owner...');
    
    if (!companyName) {
        return { owner: null, insights: 'Информация о компании не найдена' };
    }
    
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
        return { insights: 'OpenAI API key is not configured' };
    }
    
    const prompt = `Найди информацию о компании "${companyName}" (сайт: ${websiteUrl}).

Используя общедоступную информацию, найди:
1. Полное название компании и юридическая форма (ООО, ИП и т.д.)
2. Имя руководителя/директора (если доступно)
3. Основная деятельность компании
4. Интересные факты или достижения

Если информации нет - честно напиши что не найдено.

Верни короткий отчёт (3-5 предложений) на русском языке.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500
        })
    });
    
    const data = await response.json();
    const insights = data.choices[0].message.content;
    
    console.log('✅ Research complete');
    return { insights };
}

async function generatePersonalizedProposal(data) {
    console.log('✍️ Generating personalized proposal...');
    
    const {
        websiteUrl,
        zones,
        language,
        companyName,
        ownerInfo,
        emails
    } = data;
    
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
        return 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.';
    }
    
    // Determine template language
    const isEnglish = language === 'en';
    
    const availableZones = zones.filter(z => z.available);
    const zonesDescription = availableZones.map((z, i) => 
        `${i+1}. ${z.name} — ${z.description}`
    ).join('\n');
    
    const prompt = isEnglish ? 
        `Generate a personalized commercial proposal in ENGLISH for advertising placement.
        
Website: ${websiteUrl}
Company: ${companyName || 'Website owner'}
Owner info: ${ownerInfo?.insights || 'Not available'}
Available ad zones: 
${zonesDescription}

Write a professional email following this structure:
1. Greeting (personalized if owner name available)
2. Compliment about their website/content
3. Brief about Adlook company
4. List of advertising opportunities
5. Call to action

Be professional and persuasive. Full email in English.`
        :
        `Сгенерируй персонализированное коммерческое предложение на РУССКОМ языке.

Сайт: ${websiteUrl}
Компания: ${companyName || 'Владелец сайта'}
Информация о владельце: ${ownerInfo?.insights || 'Не найдена'}
Доступные рекламные места:
${zonesDescription}

Напиши профессиональное письмо по структуре:
1. Приветствие (персонализированное если есть имя)
2. Комплимент про их сайт/контент (конкретный, основанный на информации)
3. Кратко про компанию Adlook
4. Список рекламных возможностей
5. Призыв к действию

Используй шаблон из примера Adlook. Без звёздочек (*). Профессиональный тон.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0.7
        })
    });
    
    const result = await response.json();
    const proposal = result.choices[0].message.content;
    
    console.log('✅ Proposal generated');
    return proposal;
}

// Main function that orchestrates everything
async function analyzeWebsiteComplete(url) {
    console.log('\n🚀 === STARTING COMPLETE ANALYSIS ===\n');
    
    try {
        // 1. Capture screenshot
        console.log('STEP 1: Screenshot');
        const screenshotDataUrl = await captureScreenshot(url);
        
        // 2. Analyze with Vision AI
        console.log('\nSTEP 2: Vision Analysis');
        const visionAnalysis = await analyzeScreenshotForAds(url, screenshotDataUrl);
        
        // 3. Scrape website data
        console.log('\nSTEP 3: Scraping');
        const scraped = await scrapeWebsiteData(url);
        
        // 4. Research company
        console.log('\nSTEP 4: Research');
        const ownerInfo = await researchCompanyOwner(scraped.companyName, url);
        
        // 5. Generate proposal
        console.log('\nSTEP 5: Generate Proposal');
        const proposal = await generatePersonalizedProposal({
            websiteUrl: url,
            zones: visionAnalysis.zones,
            language: visionAnalysis.language,
            companyName: scraped.companyName,
            ownerInfo,
            emails: scraped.emails
        });
        
        console.log('\n✅ === ANALYSIS COMPLETE ===\n');
        
        return {
            success: true,
            screenshot: screenshotDataUrl,
            zones: visionAnalysis.zones,
            language: visionAnalysis.language,
            emails: scraped.emails,
            companyName: scraped.companyName,
            ownerInfo: ownerInfo.insights,
            proposal
        };
        
    } catch (error) {
        console.error('\n❌ === ANALYSIS FAILED ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        return {
            success: false,
            error: error.message
        };
    }
}

// Test function
async function runTest(url) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing: ${url}`);
    console.log('='.repeat(80));
    
    const startTime = Date.now();
    const result = await analyzeWebsiteComplete(url);
    const responseTime = Date.now() - startTime;
    
    console.log(`\nResponse Time: ${responseTime}ms (${(responseTime/1000).toFixed(2)}s)`);
    
    if (result.success) {
        console.log('\n✅ SCREENSHOT CAPTURED: Success');
        console.log('✅ VISION ANALYSIS: Completed');
        console.log(`✅ ZONES DETECTED: ${result.zones.length} zones`);
        console.log(`✅ EMAILS FOUND: ${result.emails.length} emails`);
        console.log(`✅ COMPANY: ${result.companyName || 'Not found'}`);
        console.log(`✅ LANGUAGE: ${result.language}`);
        console.log('✅ PROPOSAL GENERATED: Success');
        
        if (result.zones.length > 0) {
            console.log('\nDetected Zones:');
            result.zones.forEach((zone, idx) => {
                console.log(`  ${idx + 1}. ${zone.name} - ${zone.available ? 'Available' : 'Not Available'} - ${zone.priority} priority`);
            });
        }
        
        if (result.emails.length > 0) {
            console.log('\nFound Emails:');
            result.emails.forEach((email, idx) => {
                console.log(`  ${idx + 1}. ${email}`);
            });
        }
        
        console.log('\nProposal Text Preview:');
        console.log('-'.repeat(80));
        const lines = result.proposal.split('\n');
        lines.slice(0, 15).forEach(line => console.log(line));
        if (lines.length > 15) {
            console.log('... (truncated)');
        }
        console.log('-'.repeat(80));
        
        // Check for asterisks
        const hasAsterisks = result.proposal.includes('*');
        if (hasAsterisks) {
            console.log('\n❌ ASTERISKS FOUND: Proposal contains * characters');
        } else {
            console.log('\n✅ NO ASTERISKS: Proposal text clean');
        }
        
        console.log('\n✅ OVERALL: Test PASSED for ' + url);
        
        return {
            url,
            success: true,
            responseTime,
            zonesCount: result.zones.length,
            zones: result.zones,
            emailsCount: result.emails.length,
            emails: result.emails,
            companyName: result.companyName,
            language: result.language,
            proposalLength: result.proposal.length,
            hasAsterisks
        };
        
    } else {
        console.log('\n❌ TEST FAILED');
        console.log('Error:', result.error);
        
        return {
            url,
            success: false,
            error: result.error,
            responseTime
        };
    }
}

// Command line interface
if (require.main === module) {
    const url = process.argv[2];
    
    if (!url) {
        console.log('Usage: node test-parser.js <url>');
        console.log('Example: node test-parser.js https://nlabteam.com');
        process.exit(1);
    }
    
    runTest(url)
        .then(result => {
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { analyzeWebsiteComplete, runTest };