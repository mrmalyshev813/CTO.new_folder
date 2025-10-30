const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const { url } = JSON.parse(event.body);
    
    console.log('📸 === SCREENSHOT START ===');
    console.log('Target URL:', url);
    
    let browser;
    try {
        // Launch browser
        console.log('🚀 Launching browser...');
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
        console.log('✅ Browser launched');
        
        // Open page
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Navigate
        console.log('🌐 Navigating to page...');
        await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 15000 
        });
        console.log('✅ Page loaded');
        
        // Wait a bit for dynamic content to render
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Capture screenshot
        console.log('📸 Capturing screenshot...');
        const screenshot = await page.screenshot({
            fullPage: true,
            type: 'png'
        });
        console.log('✅ Screenshot captured');
        
        await browser.close();
        
        // Return base64
        const base64 = screenshot.toString('base64');
        console.log('✅ === SCREENSHOT SUCCESS ===');
        
        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                screenshot: `data:image/png;base64,${base64}`
            })
        };
        
    } catch (error) {
        console.error('❌ === SCREENSHOT FAILED ===');
        console.error('Error:', error.message);
        
        if (browser) await browser.close();
        
        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: `Screenshot failed: ${error.message}`
            })
        };
    }
};
