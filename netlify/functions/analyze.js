const { OpenAI } = require('openai');
const cheerio = require('cheerio');

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
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
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    let body;
    try {
        body = event.body ? JSON.parse(event.body) : {};
    } catch (parseError) {
        console.error('❌ Failed to parse request body:', parseError.message);
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
        console.error('❌ URL is missing in the request');
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

    const normalizedUrl = normalizeUrl(rawUrl);

    if (!normalizedUrl) {
        console.error('❌ Invalid URL provided:', rawUrl);
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
    
    console.log('\n🔍 === ANALYSIS START ===');
    console.log('URL:', url);
    
    try {
        // Get API key from header or environment variable
        const apiKey = event.headers['x-openai-api-key'] || process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            console.error('❌ API key is missing');
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
        
        console.log('✅ API key found');
        
        console.log('\n🌐 STEP 0: Checking website availability...');
        const availability = await ensureWebsiteAccessible(url);
        if (!availability.ok) {
            console.error('❌ Website availability check failed:', availability.reason);
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
        
        const openai = new OpenAI({
            apiKey: apiKey
        });
        
        // STEP 1: Get screenshot
        console.log('\n📸 STEP 1: Getting screenshot...');
        const screenshotController = new AbortController();
        const screenshotTimeout = setTimeout(() => screenshotController.abort(), 20000);
        
        const screenshotResponse = await fetch(`${process.env.URL}/.netlify/functions/screenshot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
            signal: screenshotController.signal
        });
        clearTimeout(screenshotTimeout);
        
        if (!screenshotResponse.ok) {
            throw new Error('Failed to get screenshot');
        }
        
        const screenshotData = await screenshotResponse.json();
        const screenshot = screenshotData.screenshot;
        console.log('✅ Screenshot obtained');
        
        // STEP 2: Analyze with Vision AI
        console.log('\n🤖 STEP 2: Analyzing with OpenAI Vision...');
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
        
        const analysis = JSON.parse(visionCompletion.choices[0].message.content);
        console.log('✅ Vision analysis complete');
        console.log('Found zones:', analysis.zones.length);
        console.log('Language:', analysis.language);
        
        // STEP 3: Scrape for email and company
        console.log('\n📧 STEP 3: Scraping website...');
        const scraped = await scrapeWebsite(url);
        console.log('✅ Scraping complete');
        console.log('Emails found:', scraped.emails.length);
        console.log('Company:', scraped.companyName || 'Not found');
        
        // STEP 4: Research company owner
        console.log('\n🔎 STEP 4: Researching owner...');
        const ownerInfo = await researchOwner(scraped.companyName, url, openai);
        console.log('✅ Research complete');
        
        // STEP 5: Generate personalized proposal
        console.log('\n✍️ STEP 5: Generating proposal...');
        const proposal = await generateProposal({
            url,
            zones: analysis.zones,
            language: analysis.language,
            companyName: scraped.companyName,
            emails: scraped.emails,
            ownerInfo,
            openai
        });
        console.log('✅ Proposal generated');
        
        console.log('\n🎉 === ANALYSIS COMPLETE ===\n');
        
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
                zones: analysis.zones,
                language: analysis.language,
                emails: scraped.emails,
                companyName: scraped.companyName,
                ownerInfo,
                proposal
            })
        };
        
    } catch (error) {
        console.error('\n❌ === ANALYSIS FAILED ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        
        // Check if it's a timeout error
        let errorMessage = error.message;
        let statusCode = 500;
        
        if (error.name === 'AbortError' || error.message.includes('abort')) {
            errorMessage = 'Request timeout: The website took too long to respond. Please try again or check if the website is accessible.';
            statusCode = 504;
        }
        
        return {
            statusCode: statusCode,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: errorMessage
            })
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
    } catch (error) {
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
                } catch (cancelError) {
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
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AdlookBot/1.0)'
            },
            signal: controller.signal
        });
        clearTimeout(timeout);
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Find emails
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const bodyText = $('body').text();
        const foundEmails = bodyText.match(emailRegex) || [];
        
        // Also check mailto links
        $('a[href^="mailto:"]').each((i, el) => {
            const email = $(el).attr('href').replace('mailto:', '').split('?')[0];
            foundEmails.push(email);
        });
        
        const emails = [...new Set(foundEmails)].filter(e => e && e.includes('@'));
        
        // Find company name
        let companyName = $('meta[property="og:site_name"]').attr('content') ||
                         $('meta[name="author"]').attr('content');
        
        if (!companyName) {
            const titleText = $('title').text();
            companyName = titleText.split('|')[0].split('-')[0].trim();
        }
        
        // Try to find legal entity in footer
        const footerText = $('footer').text();
        const legalEntityMatch = footerText.match(/(ООО|ИП|АО|ЗАО|ПАО)\s+["«]?([^"»\n]{3,50})["»]?/);
        if (legalEntityMatch && !companyName) {
            companyName = legalEntityMatch[0];
        }
        
        return {
            emails,
            companyName,
            title: $('title').text(),
            description: $('meta[name="description"]').attr('content')
        };
        
    } catch (error) {
        console.error('Scraping error:', error.message);
        if (error.name === 'AbortError') {
            console.log('⚠️ Scraping timed out after 10 seconds');
        }
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
    if (!companyName) {
        return 'Company information not found';
    }
    
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user',
                content: `Find brief information about company "${companyName}" (website: ${url}).

Using publicly available information, provide:
- Full company name and legal form
- Main business activity
- Any notable achievements

Keep it brief (2-3 sentences). If no info found, say so honestly.

Respond in Russian if company is Russian, in English otherwise.`
            }],
            max_tokens: 400
        });
        
        return completion.choices[0].message.content;
        
    } catch (error) {
        console.error('Research error:', error);
        return 'Failed to research company';
    }
}

// Helper: Generate proposal
async function generateProposal(data) {
    const { url, zones, language, companyName, _emails, ownerInfo, openai } = data;
    
    const availableZones = zones.filter(z => z.available);
    
    if (availableZones.length === 0) {
        return language === 'en' ?
            'No available advertising spaces found on this website.' :
            'На данном сайте не найдено свободных рекламных мест.';
    }
    
    const zonesText = availableZones.map((z, i) => 
        `${i + 1}. ${z.name} — ${z.description}`
    ).join('\n');
    
    const isEnglish = language === 'en';
    
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
    
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0.7
        });
        
        return completion.choices[0].message.content;
        
    } catch (error) {
        console.error('Proposal generation error:', error);
        return 'Failed to generate proposal';
    }
}
