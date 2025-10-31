const { OpenAI } = require('openai');

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

    try {
        const body = JSON.parse(event.body || '{}');
        console.log('📥 Request body:', JSON.stringify(body, null, 2));

        const headers = event.headers || {};
        let headerApiKey;
        for (const name in headers) {
            if (typeof name === 'string' && name.toLowerCase() === 'x-openai-api-key') {
                headerApiKey = headers[name];
                break;
            }
        }

        const { url, apiKey: bodyApiKey } = body;
        if (!url) {
            throw new Error("URL is required");
        }

        const requestApiKey = bodyApiKey || headerApiKey;
        const OPENAI_KEY = requestApiKey || process.env.OPENAI_API_KEY;

        console.log('Checking OpenAI API key...');
        console.log('🔑 API Key from request body:', bodyApiKey ? 'YES' : 'NO');
        console.log('🔑 API Key from header:', headerApiKey ? 'YES' : 'NO');
        console.log('🔑 API Key from env:', process.env.OPENAI_API_KEY ? 'YES' : 'NO');
        console.log('🔑 Using key:', OPENAI_KEY ? 'YES' : 'NO');
        console.log('Key present:', !!OPENAI_KEY);
        console.log('Key length:', OPENAI_KEY?.length);
        console.log('Key prefix:', OPENAI_KEY?.substring(0, 10) + '...');

        if (!OPENAI_KEY) {
            console.log('❌ OPENAI_API_KEY not provided');
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'OPENAI_API_KEY not set',
                    message: 'Введите API ключ на странице'
                })
            };
        }

        const openai = new OpenAI({
            apiKey: OPENAI_KEY
        });

        console.log('📸 Getting screenshot...');
        const screenshotResponse = await fetch(`${process.env.URL}/.netlify/functions/screenshot`, {
            method: 'POST',
            body: JSON.stringify({
                url,
                apiKey: OPENAI_KEY
            })
        });
        if (!screenshotResponse.ok) {
            const errorText = await screenshotResponse.text();
            throw new Error(`Screenshot service failed with status ${screenshotResponse.status}: ${errorText}`);
        }
        const screenshotData = await screenshotResponse.json();
        if (!screenshotData.success) {
            throw new Error(`Screenshot failed: ${screenshotData.error}`);
        }
        console.log('✅ Screenshot obtained');
        
        console.log('📤 Uploading screenshot to OpenAI Files API...');
        const screenshotBuffer = Buffer.from(screenshotData.screenshot, 'base64');
        const file = await openai.files.create({
            file: screenshotBuffer,
            purpose: 'vision'
        });
        console.log('✅ File uploaded:', file.id);
        
        console.log('🤖 Analyzing with OpenAI Vision...');
        const visionCompletion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Analyze this screenshot of ${url} and return a JSON object with "zones" and "language".`
                    },
                    {
                        type: 'image_file',
                        image_file: {
                            file_id: file.id
                        }
                    }
                ]
            }],
            response_format: { type: 'json_object' },
            max_tokens: 2000
        });
        
        const analysis = JSON.parse(visionCompletion.choices[0].message.content);
        console.log('✅ Vision analysis complete');
        
        console.log('🗑️ Deleting file from OpenAI...');
        await openai.files.delete(file.id);
        console.log('✅ File deleted:', file.id);

        const result = {
            success: true,
            analysis: analysis
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