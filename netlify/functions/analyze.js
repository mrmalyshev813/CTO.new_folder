const { OpenAI } = require('openai');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const sharp = require('sharp');

const BLOCKED_RESOURCE_TYPES = new Set(['image', 'stylesheet', 'font', 'media']);
const MAX_PAGE_TIMEOUT = 10000;
const MAX_SCREENSHOT_BYTES = 1024 * 1024; // 1MB
const SCREENSHOT_WIDTH = 1280;
const SCREENSHOT_HEIGHT = 800;

function getHeaderApiKey(headers = {}) {
    for (const name in headers) {
        if (Object.prototype.hasOwnProperty.call(headers, name) && typeof name === 'string') {
            if (name.toLowerCase() === 'x-openai-api-key') {
                return headers[name];
            }
        }
    }
    return undefined;
}

function parseVisionResponse(content) {
    if (!content) {
        return {};
    }

    if (typeof content === 'object') {
        return content;
    }

    if (typeof content === 'string') {
        try {
            return JSON.parse(content);
        } catch (error) {
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    return JSON.parse(match[0]);
                } catch (innerError) {
                    console.warn('⚠️ Failed to parse matched JSON from vision response:', innerError.message);
                }
            }
            console.warn('⚠️ Vision response is not valid JSON:', error.message);
        }
    }

    return {};
}

exports.handler = async (event) => {
    const startTime = Date.now();
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
    let finalScreenshot = null;
    const performanceMetrics = {};
    let blockedResources = 0;
    let targetUrl = null;

    try {
        const body = JSON.parse(event.body || '{}');
        console.log('📥 Request body:', JSON.stringify(body, null, 2));

        const headerApiKey = getHeaderApiKey(event.headers);
        const { url, apiKey: bodyApiKey } = body;
        targetUrl = url;

        if (!url) {
            throw new Error('URL is required');
        }

        const requestApiKey = bodyApiKey || headerApiKey;
        const OPENAI_KEY = requestApiKey || process.env.OPENAI_API_KEY;

        console.log('Checking OpenAI API key...');
        console.log('🔑 API Key from request body:', bodyApiKey ? 'YES' : 'NO');
        console.log('🔑 API Key from header:', headerApiKey ? 'YES' : 'NO');
        console.log('🔑 API Key from env:', process.env.OPENAI_API_KEY ? 'YES' : 'NO');
        console.log('🔑 Using key:', OPENAI_KEY ? 'YES' : 'NO');

        if (!OPENAI_KEY) {
            console.log('❌ OPENAI_API_KEY not provided');
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    error: 'OPENAI_API_KEY not set',
                    message: 'Введите API ключ на странице'
                })
            };
        }

        const openai = new OpenAI({ apiKey: OPENAI_KEY });

        console.log('🚀 Launching browser...');
        const browserLaunchStart = Date.now();
        const launchArgs = Array.from(new Set([
            ...chromium.args,
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--disable-gpu'
        ]));

        browser = await puppeteer.launch({
            args: launchArgs,
            defaultViewport: {
                width: SCREENSHOT_WIDTH,
                height: SCREENSHOT_HEIGHT
            },
            executablePath: await chromium.executablePath(),
            headless: true
        });
        performanceMetrics.browserLaunch = Date.now() - browserLaunchStart;
        console.log('⏱️ Browser launch:', performanceMetrics.browserLaunch, 'ms');

        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (BLOCKED_RESOURCE_TYPES.has(type)) {
                blockedResources += 1;
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log('🌐 Navigating to:', url);
        const pageLoadStart = Date.now();
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: MAX_PAGE_TIMEOUT
        });
        performanceMetrics.pageLoad = Date.now() - pageLoadStart;
        console.log('⏱️ Page load:', performanceMetrics.pageLoad, 'ms');
        console.log('🚫 Blocked resources:', blockedResources);

        const screenshotStart = Date.now();
        const screenshot = await page.screenshot({
            type: 'jpeg',
            quality: 60,
            fullPage: false,
            clip: { x: 0, y: 0, width: SCREENSHOT_WIDTH, height: SCREENSHOT_HEIGHT }
        });
        performanceMetrics.screenshot = Date.now() - screenshotStart;
        console.log('⏱️ Screenshot:', performanceMetrics.screenshot, 'ms');
        console.log('📏 Screenshot size (bytes):', screenshot.length);

        finalScreenshot = screenshot;
        if (screenshot.length > MAX_SCREENSHOT_BYTES) {
            console.log(`📉 Screenshot exceeds ${MAX_SCREENSHOT_BYTES} bytes. Compressing...`);
            const compressionStart = Date.now();
            finalScreenshot = await sharp(screenshot)
                .resize(1024, 768, { fit: 'inside' })
                .jpeg({ quality: 50 })
                .toBuffer();
            performanceMetrics.compression = Date.now() - compressionStart;
            console.log('⏱️ Compression:', performanceMetrics.compression, 'ms');
            console.log('📏 Compressed size (bytes):', finalScreenshot.length);
        }

        await page.close();
        await browser.close();
        browser = null;
        console.log('✅ Browser closed');

        const base64 = finalScreenshot.toString('base64');
        const imageUrl = `data:image/jpeg;base64,${base64}`;
        console.log('✅ Base64 image ready for Vision API');

        const prompt = `Analyze screenshot. Find ad zones. Return JSON:\n{\n  "zones": [{"name": "Header", "available": true, "size": "728x90"}]\n}`;

        console.log('🤖 Sending request to OpenAI Vision...');
        const visionStart = Date.now();
        const visionCompletion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    {
                        type: 'image_url',
                        image_url: {
                            url: imageUrl,
                            detail: 'low'
                        }
                    }
                ]
            }],
            max_tokens: 500,
            response_format: { type: 'json_object' }
        });
        performanceMetrics.vision = Date.now() - visionStart;
        console.log('⏱️ Vision:', performanceMetrics.vision, 'ms');

        const messageContent = visionCompletion.choices?.[0]?.message?.content;
        const analysis = parseVisionResponse(messageContent);
        const zones = Array.isArray(analysis.zones) ? analysis.zones : [];

        const totalTime = Date.now() - startTime;
        performanceMetrics.totalTime = totalTime;
        console.log('⏱️ Total execution time:', totalTime, 'ms');

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                screenshot: imageUrl,
                zones,
                language: analysis.language,
                companyName: analysis.companyName,
                ownerInfo: analysis.ownerInfo,
                emails: analysis.emails,
                proposal: analysis.proposal,
                metadata: {
                    url,
                    blockedResources,
                    screenshotBytes: finalScreenshot.length,
                    performanceMetrics
                }
            })
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                error: error.message,
                details: {
                    name: error.name,
                    stack: error.stack,
                    url: targetUrl,
                    blockedResources,
                    performanceMetrics
                }
            })
        };
    }
};
