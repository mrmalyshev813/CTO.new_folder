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
        console.log('📥 Input:', JSON.stringify(body, null, 2));

        const { url } = body;
        if (!url) {
            throw new Error("URL is required");
        }

        console.log('Checking OpenAI API key...');
        console.log('Key present:', !!process.env.OPENAI_API_KEY);
        console.log('Key length:', process.env.OPENAI_API_KEY?.length);
        console.log('Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');

        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not set');
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        console.log('📸 Getting screenshot...');
        const screenshotResponse = await fetch(`${process.env.URL}/.netlify/functions/screenshot`, {
            method: 'POST',
            body: JSON.stringify({ url })
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
                        type: 'image_url',
                        image_url: {
                            url: screenshotData.screenshot,
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