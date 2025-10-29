const { chromium } = require('playwright');
const cheerio = require('cheerio');

// Mock OpenAI responses for testing
const mockVisionResponse = {
    zones: [
        {
            name: "Header",
            available: true,
            size: "728x90",
            priority: "high",
            description: "Верхняя часть сайта с навигацией, отличное место для рекламного баннера"
        },
        {
            name: "Sidebar",
            available: true,
            size: "300x250",
            priority: "medium",
            description: "Боковая панель справа, подходит для вертикальных баннеров"
        },
        {
            name: "Content",
            available: true,
            size: "468x60",
            priority: "high",
            description: "Внутри основного контента между блоками информации"
        }
    ],
    language: "ru"
};

const mockOwnerInfo = {
    insights: "NLab Team - это веб-студия, специализирующаяся на разработке сайтов и цифровых решений. Компания предоставляет услуги по созданию веб-приложений и предлагает комплексные решения для бизнеса."
};

const mockProposal = `Тема: Предложение по рекламе на сайте https://nlabteam.com

Здравствуйте!

Хочу отметить высокий профессионализм вашей команды NLab Team. Ваш сайт демонстрирует отличные примеры работ и впечатляющий портфолио в области веб-разработки.

Немного о нас: Adlook — это российская SSP-платформа (Supply-Side Platform), основанная в 2018 году в Санкт-Петербурге. Мы помогаем владельцам сайтов монетизировать свои ресурсы.

Мы проанализировали ваш сайт и выделили несколько эффективных зон:
1. Header — Верхняя часть сайта с навигацией, отличное место для рекламного баннера
2. Sidebar — Боковая панель справа, подходит для вертикальных баннеров
3. Content — Внутри основного контента между блоками информации

Потенциальный доход: от 50,000 до 150,000 рублей в месяц.

Что мы предлагаем:
- Сроки размещения: от одного месяца
- Форматы: баннеры, контекстная реклама, всплывающие окна
- Программная настройка рекламы под ваш сайт

С уважением,
Менеджер по работе с партнёрами, Adlook`;

async function captureScreenshot(url) {
    console.log('📸 Capturing screenshot for:', url);
    
    let browser;
    try {
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage({
            viewport: { width: 1920, height: 1080 }
        });
        
        await page.goto(url, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        const screenshot = await page.screenshot({
            fullPage: true,
            type: 'png'
        });
        
        console.log('✅ Screenshot captured');
        
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
    console.log('🤖 Analyzing screenshot with OpenAI Vision (MOCK)...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Vision analysis complete (MOCK):', mockVisionResponse);
    return mockVisionResponse;
}

async function scrapeWebsiteData(url) {
    console.log('🔍 Scraping website data...');
    
    try {
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
            
            const emails = [];
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            
            const text = $('body').text();
            const foundEmails = text.match(emailRegex) || [];
            emails.push(...foundEmails);
            
            $('a[href^="mailto:"]').each((i, el) => {
                const email = $(el).attr('href').replace('mailto:', '');
                emails.push(email);
            });
            
            let companyName = $('meta[property="og:site_name"]').attr('content') ||
                              $('meta[name="author"]').attr('content') ||
                              $('title').text().split('|')[0].trim();
            
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
    console.log('🔎 Researching company owner (MOCK)...');
    
    if (!companyName) {
        return { owner: null, insights: 'Информация о компании не найдена' };
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Research complete (MOCK)');
    return mockOwnerInfo;
}

async function generatePersonalizedProposal(data) {
    console.log('✍️ Generating personalized proposal (MOCK)...');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('✅ Proposal generated (MOCK)');
    return mockProposal;
}

async function analyzeWebsiteComplete(url) {
    console.log('\n🚀 === STARTING COMPLETE ANALYSIS ===\n');
    
    try {
        console.log('STEP 1: Screenshot');
        const screenshotDataUrl = await captureScreenshot(url);
        
        console.log('\nSTEP 2: Vision Analysis');
        const visionAnalysis = await analyzeScreenshotForAds(url, screenshotDataUrl);
        
        console.log('\nSTEP 3: Scraping');
        const scraped = await scrapeWebsiteData(url);
        
        console.log('\nSTEP 4: Research');
        const ownerInfo = await researchCompanyOwner(scraped.companyName, url);
        
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

if (require.main === module) {
    const url = process.argv[2];
    
    if (!url) {
        console.log('Usage: node test-parser-mock.js <url>');
        console.log('Example: node test-parser-mock.js https://nlabteam.com');
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