const { OpenAI } = require('openai');
const cheerio = require('cheerio');

exports.handler = async (event) => {
    console.log('\n========================================');
    console.log('🤖 OPENAI ANALYSIS START');
    console.log('========================================');
    console.log('📍 Step 0: Initial request analysis');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('🔧 Node version:', process.version);
    console.log('💾 Memory usage:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
    console.log('🌐 Environment URL:', process.env.URL);
    console.log('📦 Event body size:', JSON.stringify(event.body || '{}').length, 'bytes');
    console.log('🔑 OpenAI API key present:', !!process.env.OPENAI_API_KEY);
    console.log('📋 Request headers:', Object.keys(event.headers || {}));
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        console.log('✅ CORS preflight request');
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, X-OpenAI-API-Key',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }
    
    if (event.httpMethod !== 'POST') {
        console.log('❌ Method not allowed:', event.httpMethod);
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    console.log('\n📍 Step 1: Parsing request body...');
    let body;
    try {
        body = event.body ? JSON.parse(event.body) : {};
        console.log('✅ Request body parsed successfully');
        console.log('📊 Body keys:', Object.keys(body));
        console.log('🔗 URL provided:', !!body.url);
        console.log('📏 Body size:', JSON.stringify(body).length, 'bytes');
    } catch (parseError) {
        console.error('❌ Failed to parse request body:', parseError.message);
        console.error('🔍 Raw body preview:', (event.body || '').substring(0, 200));
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'Invalid request payload. Please send JSON with a "url" field.'
            })
        };
    }

    const rawUrl = body?.url;

    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
        console.error('❌ URL is missing or invalid in the request');
        console.error('📊 rawUrl:', rawUrl);
        console.error('📊 Type:', typeof rawUrl);
        console.error('📊 Length:', rawUrl?.length);
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'Website URL is required. Provide it in the request body as {"url": "https://example.com"}.'
            })
        };
    }

    console.log('\n📍 Step 2: Normalizing URL...');
    console.log('🔗 Original URL:', rawUrl);
    console.log('📏 Original length:', rawUrl.length);
    console.log('🔍 Has protocol:', /^https?:\/\//i.test(rawUrl));
    
    const normalizedUrl = normalizeUrl(rawUrl);

    if (!normalizedUrl) {
        console.error('❌ URL normalization failed');
        console.error('📊 Input:', rawUrl);
        console.error('📊 Output:', normalizedUrl);
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'The provided URL is invalid. Please use a full website address like "https://example.com".'
            })
        };
    }

    const url = normalizedUrl;
    console.log('✅ URL normalized successfully');
    console.log('🔗 Final URL:', url);
    console.log('📏 Final length:', url.length);
    
    const analysisStartTime = Date.now();
    console.log('⏱️ Analysis started at:', new Date(analysisStartTime).toISOString());
    
    try {
        console.log('\n📍 Step 3: Checking API key configuration...');
        // Get API key from header or environment variable
        const apiKey = event.headers['x-openai-api-key'] || process.env.OPENAI_API_KEY;
        const apiKeySource = event.headers['x-openai-api-key'] ? 'header' : 'environment';
        
        console.log('🔑 API key source:', apiKeySource);
        console.log('🔑 API key present:', !!apiKey);
        console.log('🔑 API key length:', apiKey?.length || 0);
        console.log('🔑 API key prefix:', apiKey?.substring(0, 10) + '...');
        
        if (!apiKey) {
            console.error('❌ API key is missing from both header and environment');
            console.error('🔍 Header keys:', Object.keys(event.headers));
            console.error('🔍 Environment OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'The OPENAI_API_KEY is missing. Please configure your API key in the settings.'
                })
            };
        }
        
        console.log('✅ API key validated');
        
        console.log('\n📍 Step 4: Checking website availability...');
        console.log('🌐 Target URL:', url);
        console.log('⏱️ Availability timeout: 8000ms');
        
        const availabilityStart = Date.now();
        const availability = await ensureWebsiteAccessible(url);
        const availabilityTime = Date.now() - availabilityStart;
        
        console.log('⏱️ Availability check completed in', availabilityTime, 'ms');
        console.log('✅ Available:', availability.ok);
        console.log('📊 Status code:', availability.statusCode);
        console.log('📊 Reason:', availability.reason);
        
        if (!availability.ok) {
            console.error('❌ Website availability check failed:', availability.reason);
            console.error('📊 Full availability object:', JSON.stringify(availability, null, 2));
            return {
                statusCode: availability.statusCode || 504,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, X-OpenAI-API-Key',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                body: JSON.stringify({
                    success: false,
                    error: availability.message
                })
            };
        }
        console.log('✅ Website availability confirmed');
        
        console.log('\n📍 Step 5: Initializing OpenAI client...');
        const openaiStart = Date.now();
        const openai = new OpenAI({
            apiKey: apiKey
        });
        const openaiTime = Date.now() - openaiStart;
        console.log('✅ OpenAI client initialized in', openaiTime, 'ms');
        console.log('💾 Memory after OpenAI init:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        
        console.log('\n📍 Step 6: Getting screenshot...');
        console.log('📸 Screenshot function URL:', `${process.env.URL}/.netlify/functions/screenshot`);
        console.log('⏱️ Screenshot timeout: 90000ms');
        console.log('📦 Request payload size:', JSON.stringify({ url }).length, 'bytes');
        
        const screenshotController = new AbortController();
        const screenshotTimeout = setTimeout(() => screenshotController.abort(), 90000);
        
        const screenshotStart = Date.now();
        
        try {
            const screenshotResponse = await fetch(`${process.env.URL}/.netlify/functions/screenshot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
                signal: screenshotController.signal
            });
            
            clearTimeout(screenshotTimeout);
            const screenshotTime = Date.now() - screenshotStart;
            
            console.log('⏱️ Screenshot request completed in', screenshotTime, 'ms');
            console.log('📊 Response status:', screenshotResponse.status);
            console.log('📊 Response headers:', Object.keys(screenshotResponse.headers));
            
            if (!screenshotResponse.ok) {
                console.error('❌ Screenshot request failed with status:', screenshotResponse.status);
                
                let errorDetails;
                try {
                    errorDetails = await screenshotResponse.json();
                    console.error('📊 Error details from screenshot:', JSON.stringify(errorDetails, null, 2));
                } catch (parseError) {
                    console.error('❌ Failed to parse screenshot error response:', parseError.message);
                    errorDetails = { error: 'Failed to get screenshot', details: null };
                }
                
                const error = new Error(errorDetails.error || 'Failed to get screenshot');
                error.details = errorDetails.details;
                error.timestamp = errorDetails.timestamp;
                error.screenshotStatus = screenshotResponse.status;
                throw error;
            }
            
            const screenshotData = await screenshotResponse.json();
            console.log('✅ Screenshot response parsed successfully');
            console.log('📊 Response keys:', Object.keys(screenshotData));
            console.log('📊 Success flag:', screenshotData.success);
            
            if (!screenshotData.success) {
                console.error('❌ Screenshot function reported failure');
                console.error('📊 Error:', screenshotData.error);
                console.error('📊 Details:', screenshotData.details);
                
                const error = new Error(screenshotData.error || 'Screenshot failed');
                error.details = screenshotData.details;
                error.timestamp = screenshotData.timestamp;
                throw error;
            }
            
            const screenshot = screenshotData.screenshot;
            console.log('✅ Screenshot obtained successfully');
            console.log('📊 Screenshot length:', screenshot.length);
            console.log('📊 Screenshot MB:', (screenshot.length / (1024 * 1024)).toFixed(2));
            
            // Логировать метаданные производительности если есть
            if (screenshotData.metadata) {
                console.log('📊 === SCREENSHOT METRICS ===');
                console.log('   🎯 Attempts:', screenshotData.metadata.attempts || 1);
                console.log('   ⏱️ Load time:', screenshotData.metadata.loadTime || 'N/A', 'ms');
                console.log('   🚫 Blocked resources:', screenshotData.metadata.blockedResources || 0);
                console.log('   ✅ Allowed resources:', screenshotData.metadata.allowedResources || 0);
                console.log('   📊 Performance:', JSON.stringify(screenshotData.metadata.performanceMetrics, null, 2));
                console.log('   💾 Memory usage:', JSON.stringify(screenshotData.metadata.memoryUsage, null, 2));
            }
            
        } catch (screenshotError) {
            clearTimeout(screenshotTimeout);
            if (screenshotError.name === 'AbortError') {
                console.error('❌ Screenshot request timed out after 90 seconds');
                throw new Error('Screenshot request timeout: The screenshot function took too long to respond');
            }
            throw screenshotError;
        }
        
        console.log('\n📍 Step 7: Analyzing with OpenAI Vision API...');
        console.log('🤖 Model: gpt-4o');
        console.log('📊 Max tokens: 2000');
        console.log('📄 Response format: json_object');
        console.log('🖼️ Image detail: high');
        console.log('📊 Screenshot data URL length:', screenshot.length);
        
        const visionStart = Date.now();
        
        try {
            const visionCompletion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Analyze screenshot of ${url} for advertising opportunities.

Identify these ad zones:
1. Header (top navigation area)
2. Sidebar (left/right column)
3. Content (within main content)
4. Footer (bottom area)
5. Popup (modal windows)

For each zone provide:
- name: zone name
- available: true if space is FREE, false if OCCUPIED by ads
- size: banner size (e.g. "728x90", "300x250")
- priority: "high" for premium spots, "medium" for good spots, "low" for poor spots
- description: detailed description

Also detect website language (ru or en).

Return JSON:
{
  "zones": [
    {"name": "Header", "available": true, "size": "728x90", "priority": "high", "description": "..."}
  ],
  "language": "ru" or "en"
}`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: screenshot,
                                detail: 'high'
                            }
                        }
                    ]
                }],
                response_format: { type: 'json_object' },
                max_tokens: 2000
            });
            
            const visionTime = Date.now() - visionStart;
            console.log('✅ Vision API succeeded in', visionTime, 'ms');
            console.log('📊 Usage tokens:', visionCompletion.usage);
            console.log('📊 Choices count:', visionCompletion.choices.length);
            console.log('📊 Finish reason:', visionCompletion.choices[0].finish_reason);
            
            const analysis = JSON.parse(visionCompletion.choices[0].message.content);
            console.log('✅ Vision analysis parsed successfully');
            console.log('🎯 Zones found:', analysis.zones.length);
            console.log('🌐 Language detected:', analysis.language);
            console.log('📊 Zones:', JSON.stringify(analysis.zones, null, 2));
            
        } catch (visionError) {
            console.error('\n❌ VISION API FAILED');
            console.error('🔍 Error name:', visionError.name);
            console.error('💬 Error message:', visionError.message);
            console.error('📊 Error status:', visionError.status);
            console.error('🔑 Error code:', visionError.code);
            console.error('📋 Error type:', visionError.type);
            console.error('📊 Full error:', JSON.stringify(visionError, null, 2));
            throw visionError;
        }
        
        console.log('\n📍 Step 8: Scraping website for contact info...');
        console.log('🌐 Target URL:', url);
        console.log('⏱️ Scraping timeout: 10000ms');
        
        const scrapingStart = Date.now();
        const scraped = await scrapeWebsite(url);
        const scrapingTime = Date.now() - scrapingStart;
        
        console.log('✅ Scraping completed in', scrapingTime, 'ms');
        console.log('📧 Emails found:', scraped.emails.length);
        console.log('📧 Email list:', scraped.emails);
        console.log('🏢 Company name:', scraped.companyName || 'Not found');
        console.log('📄 Title:', scraped.title || 'Not found');
        console.log('📝 Description:', scraped.description || 'Not found');
        
        console.log('\n📍 Step 9: Researching company owner...');
        console.log('🏢 Company name:', scraped.companyName || 'Not available');
        console.log('🤖 Model: gpt-4o-mini');
        console.log('📊 Max tokens: 400');
        
        const researchStart = Date.now();
        const ownerInfo = await researchOwner(scraped.companyName, url, openai);
        const researchTime = Date.now() - researchStart;
        
        console.log('✅ Research completed in', researchTime, 'ms');
        console.log('📊 Owner info length:', ownerInfo.length);
        console.log('📄 Owner info preview:', ownerInfo.substring(0, 200) + '...');
        
        console.log('\n📍 Step 10: Generating personalized proposal...');
        console.log('🌐 URL:', url);
        console.log('🎯 Available zones:', analysis.zones.filter(z => z.available).length);
        console.log('🌐 Language:', analysis.language);
        console.log('🏢 Company:', scraped.companyName || 'Unknown');
        console.log('📧 Emails:', scraped.emails.length);
        console.log('🤖 Model: gpt-4o-mini');
        console.log('📊 Max tokens: 1500');
        console.log('🎲 Temperature: 0.7');
        
        const proposalStart = Date.now();
        const proposal = await generateProposal({
            url,
            zones: analysis.zones,
            language: analysis.language,
            companyName: scraped.companyName,
            emails: scraped.emails,
            ownerInfo,
            openai
        });
        const proposalTime = Date.now() - proposalStart;
        
        console.log('✅ Proposal generated in', proposalTime, 'ms');
        console.log('📄 Proposal length:', proposal.length);
        console.log('📄 Proposal preview:', proposal.substring(0, 300) + '...');
        
        const totalTime = Date.now() - analysisStartTime;
        
        console.log('\n========================================');
        console.log('✅ OPENAI ANALYSIS COMPLETE');
        console.log('========================================');
        console.log('⏱️ Total analysis time:', totalTime, 'ms');
        console.log('⏱️ Total time (minutes):', (totalTime / 1000 / 60).toFixed(2));
        console.log('💾 Final memory usage:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        console.log('📊 === TIMING BREAKDOWN ===');
        console.log('   Availability check:', availabilityTime, 'ms');
        console.log('   Screenshot capture:', screenshotTime, 'ms');
        console.log('   Vision analysis:', visionTime, 'ms');
        console.log('   Website scraping:', scrapingTime, 'ms');
        console.log('   Owner research:', researchTime, 'ms');
        console.log('   Proposal generation:', proposalTime, 'ms');
        console.log('========================================\n');
        
        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, X-OpenAI-API-Key',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                screenshot,
                metadata: screenshotData.metadata,
                zones: analysis.zones,
                language: analysis.language,
                emails: scraped.emails,
                companyName: scraped.companyName,
                ownerInfo,
                proposal,
                performance: {
                    totalTime: totalTime,
                    availabilityTime: availabilityTime,
                    screenshotTime: screenshotTime,
                    visionTime: visionTime,
                    scrapingTime: scrapingTime,
                    researchTime: researchTime,
                    proposalTime: proposalTime
                }
            })
        };
        
    } catch (error) {
        console.error('\n========================================');
        console.error('❌ OPENAI ANALYSIS FAILED');
        console.error('========================================');
        console.error('📍 Error step: Unknown - check stack trace');
        console.error('🔍 Error name:', error.name);
        console.error('💬 Error message:', error.message);
        console.error('📋 Error stack:', error.stack);
        console.error('⏰ Error timestamp:', new Date().toISOString());
        console.error('💾 Memory at error:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        console.error('📊 Analysis elapsed:', Date.now() - analysisStartTime, 'ms');
        
        // Check if it's a timeout error
        let errorMessage = error.message;
        let statusCode = 500;
        
        if (error.name === 'AbortError' || error.message.includes('abort') || error.message.includes('timeout')) {
            errorMessage = 'Request timeout: The website took too long to respond. Please try again or check if the website is accessible.';
            statusCode = 504;
            console.error('⏰ Detected timeout error');
        }
        
        if (error.screenshotStatus) {
            console.error('📸 Screenshot error status:', error.screenshotStatus);
        }
        
        // Подготовить детальный отчет об ошибке
        const errorReport = {
            success: false,
            error: errorMessage,
            details: error.details || {
                errorType: error.name,
                errorMessage: error.message,
                errorStack: error.stack,
                url: url,
                timestamp: error.timestamp || new Date().toISOString(),
                memoryUsage: process.memoryUsage(),
                analysisElapsed: Date.now() - analysisStartTime
            },
            timestamp: error.timestamp || new Date().toISOString()
        };
        
        console.error('📋 DETAILED ERROR REPORT:');
        console.error(JSON.stringify(errorReport, null, 2));
        console.error('========================================\n');
        
        return {
            statusCode: statusCode,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, X-OpenAI-API-Key',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify(errorReport)
        };
    }
};

function normalizeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') {
        return null;
    }

    let candidate = rawUrl.trim();
    if (!candidate) {
        return null;
    }

    if (!/^https?:\/\//i.test(candidate)) {
        candidate = `https://${candidate}`;
    }

    try {
        const normalized = new URL(candidate);
        if (!normalized.hostname) {
            return null;
        }
        return normalized.toString();
    } catch {
        return null;
    }
}

async function ensureWebsiteAccessible(url) {
    const CHECK_TIMEOUT_MS = 8000;
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (compatible; AdlookBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    };

    const attemptRequest = async (method) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                method,
                headers: HEADERS,
                redirect: 'follow',
                signal: controller.signal
            });

            if (method === 'GET' && response.body && typeof response.body.cancel === 'function') {
                try {
                    await response.body.cancel();
                } catch {
                    // Ignore stream cancel errors
                }
            }

            return { response };
        } catch (error) {
            return { error };
        } finally {
            clearTimeout(timeout);
        }
    };

    const headResult = await attemptRequest('HEAD');

    if (headResult.response) {
        console.log(`🌐 Website HEAD status: ${headResult.response.status}`);
        return { ok: true };
    }

    if (headResult.error && headResult.error.name !== 'AbortError') {
        console.log('ℹ️ HEAD request failed, trying GET fallback...');
        const getResult = await attemptRequest('GET');

        if (getResult.response) {
            console.log(`🌐 Website GET fallback status: ${getResult.response.status}`);
            return { ok: true };
        }

        if (getResult.error) {
            const failure = createReachabilityFailure(getResult.error, url);
            console.error('❌ Website availability GET fallback error:', getResult.error);
            return failure;
        }
    }

    if (headResult.error) {
        const failure = createReachabilityFailure(headResult.error, url);
        console.error('❌ Website availability HEAD error:', headResult.error);
        return failure;
    }

    return { ok: true };
}

function createReachabilityFailure(error, url) {
    if (!error) {
        return {
            ok: false,
            statusCode: 504,
            reason: 'unknown_error',
            message: `Website unreachable: ${url} could not be reached. Please ensure it is accessible and try again.`
        };
    }

    if (error.name === 'AbortError') {
        return {
            ok: false,
            statusCode: 504,
            reason: 'timeout',
            message: 'Request timeout: The website took too long to respond. Please try again or check if the website is accessible.'
        };
    }

    const parts = [
        (error.code || '').toString().toLowerCase(),
        (error.cause && error.cause.code ? error.cause.code.toString().toLowerCase() : ''),
        (error.cause && error.cause.errno ? error.cause.errno.toString().toLowerCase() : ''),
        (error.message || '').toLowerCase()
    ].filter(Boolean);

    const combined = parts.join(' ');

    const mappings = [
        {
            match: 'enotfound',
            reason: 'dns_not_found',
            message: 'Website unreachable: DNS lookup failed. Please verify the domain name and try again.'
        },
        {
            match: 'eai_again',
            reason: 'dns_timeout',
            message: 'Website unreachable: Temporary DNS issue detected. Please try again shortly.'
        },
        {
            match: 'econnrefused',
            reason: 'connection_refused',
            message: 'Website unreachable: The server refused the connection. Please make sure the website is online.'
        },
        {
            match: 'etimedout',
            reason: 'timeout',
            message: 'Request timeout: The website took too long to respond. Please try again or check if the website is accessible.'
        },
        {
            match: 'self signed certificate',
            reason: 'ssl_error',
            message: 'Website unreachable: SSL certificate error detected. Please verify the website\'s certificate.'
        }
    ];

    for (const mapping of mappings) {
        if (combined.includes(mapping.match)) {
            return {
                ok: false,
                statusCode: 504,
                reason: mapping.reason,
                message: mapping.message
            };
        }
    }

    const fallbackReason = (error.code || error.cause?.code || 'network_error') ?
        (error.code || error.cause?.code || 'network_error').toString().toLowerCase() :
        'network_error';

    return {
        ok: false,
        statusCode: 504,
        reason: fallbackReason,
        message: `Website unreachable: ${url} could not be reached. Please ensure it is accessible and try again.`
    };
}

// Helper: Scrape website
async function scrapeWebsite(url) {
    console.log('🔧 === SCRAPING HELPER START ===');
    console.log('🌐 Scraping URL:', url);
    console.log('⏱️ Timeout: 10000ms');
    console.log('🤖 User-Agent: Mozilla/5.0 (compatible; AdlookBot/1.0)');
    
    const scrapeStartTime = Date.now();
    
    try {
        console.log('📍 Step 1: Fetching website HTML...');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const fetchStart = Date.now();
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AdlookBot/1.0)'
            },
            signal: controller.signal
        });
        clearTimeout(timeout);
        const fetchTime = Date.now() - fetchStart;
        
        console.log('✅ HTML fetched in', fetchTime, 'ms');
        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', Object.keys(response.headers));
        console.log('📊 Content-Type:', response.headers.get('content-type'));
        console.log('📊 Content-Length:', response.headers.get('content-length'));
        
        console.log('📍 Step 2: Parsing HTML with Cheerio...');
        const parseStart = Date.now();
        const html = await response.text();
        const parseTime = Date.now() - parseStart;
        
        console.log('✅ HTML parsed in', parseTime, 'ms');
        console.log('📊 HTML length:', html.length);
        console.log('📊 HTML size:', (html.length / 1024).toFixed(2), 'KB');
        
        const $ = cheerio.load(html);
        
        console.log('📍 Step 3: Extracting emails...');
        const emailStart = Date.now();
        
        // Find emails in body text
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const bodyText = $('body').text();
        console.log('📊 Body text length:', bodyText.length);
        console.log('📊 Body text size:', (bodyText.length / 1024).toFixed(2), 'KB');
        
        const foundEmails = bodyText.match(emailRegex) || [];
        console.log('📧 Raw emails found in body:', foundEmails.length);
        console.log('📧 Body emails:', foundEmails);
        
        // Also check mailto links
        const mailtoLinks = $('a[href^="mailto:"]');
        console.log('📧 Mailto links found:', mailtoLinks.length);
        
        mailtoLinks.each((i, el) => {
            const href = $(el).attr('href');
            const email = href.replace('mailto:', '').split('?')[0];
            foundEmails.push(email);
            console.log(`📧 Mailto ${i + 1}:`, email);
        });
        
        const uniqueEmails = [...new Set(foundEmails)].filter(e => e && e.includes('@'));
        const emailTime = Date.now() - emailStart;
        
        console.log('✅ Email extraction completed in', emailTime, 'ms');
        console.log('📧 Total unique emails:', uniqueEmails.length);
        console.log('📧 Final email list:', uniqueEmails);
        
        console.log('📍 Step 4: Extracting company information...');
        const companyStart = Date.now();
        
        // Find company name from meta tags
        const ogSiteName = $('meta[property="og:site_name"]').attr('content');
        const authorMeta = $('meta[name="author"]').attr('content');
        const titleText = $('title').text();
        
        console.log('🏢 OG site name:', ogSiteName);
        console.log('👤 Author meta:', authorMeta);
        console.log('📄 Title text:', titleText);
        
        let companyName = ogSiteName || authorMeta;
        
        if (!companyName) {
            console.log('🔧 Extracting company name from title...');
            companyName = titleText.split('|')[0].split('-')[0].trim();
            console.log('🏢 Company from title:', companyName);
        }
        
        // Try to find legal entity in footer
        console.log('🔧 Searching for legal entity in footer...');
        const footerText = $('footer').text();
        console.log('📄 Footer text length:', footerText.length);
        console.log('📄 Footer preview:', footerText.substring(0, 200) + '...');
        
        const legalEntityMatch = footerText.match(/(ООО|ИП|АО|ЗАО|ПАО)\s+["«]?([^"»\n]{3,50})["»]?/);
        if (legalEntityMatch) {
            console.log('🏢 Legal entity found:', legalEntityMatch[0]);
            if (!companyName) {
                companyName = legalEntityMatch[0];
                console.log('🏢 Using legal entity as company name:', companyName);
            }
        } else {
            console.log('🔍 No legal entity found in footer');
        }
        
        // Extract other meta information
        const description = $('meta[name="description"]').attr('content');
        console.log('📝 Description:', description);
        
        const companyTime = Date.now() - companyStart;
        console.log('✅ Company extraction completed in', companyTime, 'ms');
        
        const totalTime = Date.now() - scrapeStartTime;
        
        console.log('📊 === SCRAPING SUMMARY ===');
        console.log('   ⏱️ Total time:', totalTime, 'ms');
        console.log('   📧 Emails found:', uniqueEmails.length);
        console.log('   🏢 Company name:', companyName || 'Not found');
        console.log('   📄 Title:', titleText || 'Not found');
        console.log('   📝 Description:', description ? 'Found' : 'Not found');
        console.log('====================================\n');
        
        return {
            emails: uniqueEmails,
            companyName,
            title: titleText,
            description
        };
        
    } catch (error) {
        console.error('\n❌ === SCRAPING ERROR ===');
        console.error('🔍 Error name:', error.name);
        console.error('💬 Error message:', error.message);
        console.error('📋 Error stack:', error.stack);
        console.error('⏱️ Scraping elapsed:', Date.now() - scrapeStartTime, 'ms');
        
        if (error.name === 'AbortError') {
            console.error('⏰ Scraping timed out after 10 seconds');
        } else {
            console.error('📊 Other scraping error occurred');
        }
        
        console.error('====================================\n');
        
        return {
            emails: [],
            companyName: null,
            title: null,
            description: null
        };
    }
}

// Helper: Research owner
async function researchOwner(companyName, url, openai) {
    console.log('🔧 === OWNER RESEARCH START ===');
    console.log('🏢 Company name:', companyName);
    console.log('🌐 Website URL:', url);
    console.log('🤖 Model: gpt-4o-mini');
    console.log('📊 Max tokens: 400');
    
    const researchStartTime = Date.now();
    
    if (!companyName) {
        console.log('⚠️ No company name provided, skipping research');
        console.log('====================================\n');
        return 'Company information not found';
    }
    
    try {
        console.log('📍 Step 1: Preparing research prompt...');
        const prompt = `Find brief information about company "${companyName}" (website: ${url}).

Using publicly available information, provide:
- Full company name and legal form
- Main business activity
- Any notable achievements

Keep it brief (2-3 sentences). If no info found, say so honestly.

Respond in Russian if company is Russian, in English otherwise.`;
        
        console.log('📝 Prompt length:', prompt.length);
        console.log('📝 Prompt preview:', prompt.substring(0, 200) + '...');
        
        console.log('📍 Step 2: Calling OpenAI API for research...');
        const apiStart = Date.now();
        
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user',
                content: prompt
            }],
            max_tokens: 400
        });
        
        const apiTime = Date.now() - apiStart;
        console.log('✅ Research API call completed in', apiTime, 'ms');
        console.log('📊 Usage tokens:', completion.usage);
        console.log('📊 Finish reason:', completion.choices[0].finish_reason);
        
        const result = completion.choices[0].message.content;
        const totalTime = Date.now() - researchStartTime;
        
        console.log('✅ Owner research completed in', totalTime, 'ms');
        console.log('📄 Result length:', result.length);
        console.log('📄 Result preview:', result.substring(0, 200) + '...');
        console.log('====================================\n');
        
        return result;
        
    } catch (error) {
        console.error('\n❌ === OWNER RESEARCH ERROR ===');
        console.error('🔍 Error name:', error.name);
        console.error('💬 Error message:', error.message);
        console.error('📊 Error status:', error.status);
        console.error('🔑 Error code:', error.code);
        console.error('📋 Error type:', error.type);
        console.error('⏱️ Research elapsed:', Date.now() - researchStartTime, 'ms');
        console.error('📊 Full error:', JSON.stringify(error, null, 2));
        console.error('====================================\n');
        
        return 'Failed to research company';
    }
}

// Helper: Generate proposal
async function generateProposal(data) {
    console.log('🔧 === PROPOSAL GENERATION START ===');
    
    const { url, zones, language, companyName, _emails, ownerInfo, openai } = data;
    
    console.log('🌐 Website URL:', url);
    console.log('🌐 Language:', language);
    console.log('🏢 Company name:', companyName || 'Not found');
    console.log('📧 Emails count:', _emails?.length || 0);
    console.log('🎯 Total zones:', zones?.length || 0);
    console.log('👤 Owner info length:', ownerInfo?.length || 0);
    console.log('🤖 Model: gpt-4o-mini');
    console.log('📊 Max tokens: 1500');
    console.log('🎲 Temperature: 0.7');
    
    const proposalStartTime = Date.now();
    
    try {
        console.log('📍 Step 1: Filtering available zones...');
        const availableZones = zones.filter(z => z.available);
        console.log('✅ Available zones:', availableZones.length);
        console.log('📊 All zones:', zones.map(z => `${z.name}: ${z.available ? '✅' : '❌'}`).join(', '));
        
        if (availableZones.length === 0) {
            console.log('⚠️ No available zones found, returning early');
            const noZonesMessage = language === 'en' ?
                'No available advertising spaces found on this website.' :
                'На данном сайте не найдено свободных рекламных мест.';
            console.log('📄 No zones message:', noZonesMessage);
            console.log('====================================\n');
            return noZonesMessage;
        }
        
        console.log('📍 Step 2: Preparing zones text...');
        const zonesText = availableZones.map((z, i) => {
            const zoneInfo = `${i + 1}. ${z.name} — ${z.description}`;
            console.log(`   📍 Zone ${i + 1}:`, z.name, '| Available:', z.available, '| Size:', z.size, '| Priority:', z.priority);
            return zoneInfo;
        }).join('\n');
        
        console.log('📝 Zones text length:', zonesText.length);
        console.log('📝 Zones preview:', zonesText.substring(0, 300) + '...');
        
        console.log('📍 Step 3: Building proposal prompt...');
        const isEnglish = language === 'en';
        console.log('🌐 Language detected:', isEnglish ? 'English' : 'Russian');
        
        const prompt = isEnglish ?
            `Write a professional advertising proposal email in English.

Website: ${url}
Company: ${companyName || 'Website owner'}
Background: ${ownerInfo}

Available advertising zones:
${zonesText}

Structure:
1. Personalized greeting
2. Compliment about their website
3. Brief about Adlook (Russian SSP platform founded in 2018)
4. List advertising opportunities with descriptions
5. Value proposition (revenue potential, formats, analytics)
6. Call to action

Professional tone. No asterisks (*). Full email text in English.` :
            `Напиши персонализированное коммерческое предложение на русском языке.

Сайт: ${url}
Компания: ${companyName || 'Владелец сайта'}
Справка: ${ownerInfo}

Доступные рекламные места:
${zonesText}

Структура письма:
1. Персонализированное приветствие
2. Конкретный комплимент про их сайт/контент
3. Кратко про Adlook (российская SSP-платформа, основана в 2018)
4. Перечисление рекламных возможностей с описаниями
5. Предложение ценности (потенциальный доход, форматы, аналитика)
6. Призыв к действию

Профессиональный тон. БЕЗ звёздочек (*). Полный текст письма на русском.`;
        
        console.log('📝 Prompt length:', prompt.length);
        console.log('📝 Prompt preview:', prompt.substring(0, 400) + '...');
        
        console.log('📍 Step 4: Calling OpenAI API for proposal generation...');
        const apiStart = Date.now();
        
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0.7
        });
        
        const apiTime = Date.now() - apiStart;
        console.log('✅ Proposal API call completed in', apiTime, 'ms');
        console.log('📊 Usage tokens:', completion.usage);
        console.log('📊 Finish reason:', completion.choices[0].finish_reason);
        
        const result = completion.choices[0].message.content;
        const totalTime = Date.now() - proposalStartTime;
        
        console.log('✅ Proposal generation completed in', totalTime, 'ms');
        console.log('📄 Result length:', result.length);
        console.log('📄 Result preview:', result.substring(0, 400) + '...');
        
        // Count some basic metrics
        const wordCount = result.split(/\s+/).length;
        const sentenceCount = result.split(/[.!?]+/).length - 1;
        const lineCount = result.split('\n').length;
        
        console.log('📊 Proposal metrics:');
        console.log('   📝 Word count:', wordCount);
        console.log('   📝 Sentence count:', sentenceCount);
        console.log('   📝 Line count:', lineCount);
        console.log('====================================\n');
        
        return result;
        
    } catch (error) {
        console.error('\n❌ === PROPOSAL GENERATION ERROR ===');
        console.error('🔍 Error name:', error.name);
        console.error('💬 Error message:', error.message);
        console.error('📊 Error status:', error.status);
        console.error('🔑 Error code:', error.code);
        console.error('📋 Error type:', error.type);
        console.error('⏱️ Proposal elapsed:', Date.now() - proposalStartTime, 'ms');
        console.error('📊 Full error:', JSON.stringify(error, null, 2));
        console.error('====================================\n');
        
        return 'Failed to generate proposal';
    }
}
