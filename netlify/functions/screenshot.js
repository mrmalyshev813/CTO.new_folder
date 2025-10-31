const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

async function loadPageWithRetry(page, url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxRetries}...`);
            
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });
            
            console.log('✅ Page loaded');
            return;
            
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) throw error;
            
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

exports.handler = async (event) => {
    console.log('\n===========================================');
    console.log('🔍 FUNCTION START:', new Date().toISOString());
    console.log('Function name:', event.rawUrl);
    console.log('===========================================\n');

    console.log('\n🔧 ENVIRONMENT CHECK:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET ✅' : 'MISSING ❌');
    console.log('URL:', process.env.URL);
    console.log('\n');

    let browser;
    try {
        const body = JSON.parse(event.body || '{}');
        console.log('📥 Input:', JSON.stringify(body, null, 2));
        
        const { url } = body;
        if (!url) {
            throw new Error("URL is required");
        }

        console.log('🚀 Launching browser...');
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless
        });
        console.log('✅ Browser launched');

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        await loadPageWithRetry(page, url);

        console.log('📸 Capturing screenshot...');
        const screenshot = await page.screenshot({
            type: 'jpeg',
            quality: 50,
            fullPage: false,
            clip: { x: 0, y: 0, width: 1280, height: 800 }
        });

        console.log('Screenshot size KB:', (screenshot.length / 1024).toFixed(2));
        if (screenshot.length > 2 * 1024 * 1024) {
            throw new Error('Screenshot too large: ' + (screenshot.length / (1024*1024)).toFixed(2) + 'MB');
        }
        console.log('✅ Screenshot captured and size is valid');

        await browser.close();
        console.log('Browser closed');

        const base64 = screenshot.toString('base64');
        const result = {
            success: true,
            screenshot: `data:image/jpeg;base64,${base64}`
        };

        console.log('\n===========================================');
        console.log('✅ FUNCTION SUCCESS');
        console.log('===========================================\n');
        
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('\n===========================================');
        console.error('❌ FUNCTION FAILED');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('===========================================\n');
        
        if (browser) {
            await browser.close();
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message,
                details: {
                    name: error.name,
                    stack: error.stack
                }
            })
        };
    }
};