const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

exports.handler = async (event) => {
    console.log('\n========================================');
    console.log('🤖 ANALYZE START');
    console.log('========================================\n');
    
    const { url, apiKey } = JSON.parse(event.body || '{}');
    
    // Валидация
    if (!url) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'URL required' })
        };
    }
    
    if (!apiKey) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'API key required' })
        };
    }
    
    console.log('URL:', url);
    console.log('API Key:', apiKey.substring(0, 10) + '...');
    
    let browser;
    
    try {
        // ШАГ 1: Скриншот
        console.log('\n📸 Step 1: Taking screenshot...');
        
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        
        await page.waitForTimeout(2000);
        
        const screenshot = await page.screenshot({
            type: 'jpeg',
            quality: 75,
            fullPage: false
        });
        
        await browser.close();
        
        console.log('✅ Screenshot taken:', (screenshot.length / 1024).toFixed(2), 'KB');
        
        const base64 = screenshot.toString('base64');
        const screenshotDataUrl = `data:image/jpeg;base64,${base64}`;
        
        // ШАГ 2: Анализ через OpenAI
        console.log('\n🤖 Step 2: Analyzing with OpenAI...');
        
        const analysisRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Проанализируй скриншот сайта ${url} и найди места для рекламы.

Определи зоны:
- Header (шапка)
- Sidebar (боковая панель)
- Content (контент)
- Footer (подвал)

Для каждой зоны:
{
  "name": "название",
  "available": true/false,
  "size": "размер баннера",
  "priority": "high/medium/low",
  "description": "описание"
}

Определи язык сайта (ru/en).

Верни JSON:
{
  "zones": [...],
  "language": "ru"
}`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: screenshotDataUrl,
                                detail: 'low'
                            }
                        }
                    ]
                }],
                response_format: { type: 'json_object' },
                max_tokens: 2000
            })
        });
        
        if (!analysisRes.ok) {
            const error = await analysisRes.json();
            throw new Error(`OpenAI Vision: ${error.error?.message || 'Unknown error'}`);
        }
        
        const analysisData = await analysisRes.json();
        const analysis = JSON.parse(analysisData.choices[0].message.content);
        
        console.log('✅ Analysis complete');
        console.log('Zones found:', analysis.zones.length);
        
        // ШАГ 3: Генерация предложения
        console.log('\n✍️ Step 3: Generating proposal...');
        
        const availableZones = analysis.zones.filter(z => z.available);
        
        let proposal = 'На данном сайте не найдено свободных мест.';
        
        if (availableZones.length > 0) {
            const zonesText = availableZones.map(z => 
                `${z.name} — ${z.description}`
            ).join('\n');
            
            const proposalPrompt = analysis.language === 'en' ?
                `Write professional email for ${url}.\n\nZones:\n${zonesText}` :
                `Напиши коммерческое предложение для ${url}.\n\nМеста:\n${zonesText}\n\nПро Adlook.`;
            
            const proposalRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: proposalPrompt }],
                    max_tokens: 1500
                })
            });
            
            const proposalData = await proposalRes.json();
            proposal = proposalData.choices[0].message.content;
        }
        
        console.log('✅ Proposal generated');
        
        // Вернуть результат
        console.log('\n✅ === SUCCESS ===\n');
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                screenshot: base64,
                zones: analysis.zones,
                language: analysis.language,
                proposal: proposal
            })
        };
        
    } catch (error) {
        console.error('\n❌ === ERROR ===');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        
        if (browser) await browser.close();
        
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
