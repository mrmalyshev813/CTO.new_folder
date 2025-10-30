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

    const { url } = JSON.parse(event.body);
    
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
        
        const openai = new OpenAI({
            apiKey: apiKey
        });
        
        // STEP 1: Get screenshot
        console.log('\n📸 STEP 1: Getting screenshot...');
        const screenshotResponse = await fetch(`${process.env.URL}/.netlify/functions/screenshot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
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
        
        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

// Helper: Scrape website
async function scrapeWebsite(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AdlookBot/1.0)'
            }
        });
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
        console.error('Scraping error:', error);
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
