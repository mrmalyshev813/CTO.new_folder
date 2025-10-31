exports.handler = async (event) => {
    console.log('\n🧪 RUNNING DEBUG TEST');
    console.log('========================================');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('🔧 Node version:', process.version);
    console.log('💾 Memory usage:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
    console.log('🌐 Environment URL:', process.env.URL);
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
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: ''
        };
    }
    
    if (event.httpMethod !== 'GET') {
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

    const testUrl = 'https://example.com';
    console.log('📍 Test URL:', testUrl);
    console.log('🎯 Purpose: Debug screenshot and OpenAI analysis pipeline');
    
    const testStartTime = Date.now();
    
    try {
        console.log('\n📍 Step 1: Testing screenshot function...');
        console.log('📸 Screenshot function URL:', `${process.env.URL}/.netlify/functions/screenshot`);
        
        const screenshotController = new AbortController();
        const screenshotTimeout = setTimeout(() => screenshotController.abort(), 120000); // 2 minutes
        
        const screenshotStart = Date.now();
        
        try {
            const screenshotResponse = await fetch(`${process.env.URL}/.netlify/functions/screenshot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: testUrl }),
                signal: screenshotController.signal
            });
            
            clearTimeout(screenshotTimeout);
            const screenshotTime = Date.now() - screenshotStart;
            
            console.log('⏱️ Screenshot request completed in', screenshotTime, 'ms');
            console.log('📊 Response status:', screenshotResponse.status);
            
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
                
                throw new Error(`Screenshot failed: ${errorDetails.error || 'Unknown error'}`);
            }
            
            const screenshotData = await screenshotResponse.json();
            console.log('✅ Screenshot response parsed successfully');
            console.log('📊 Success flag:', screenshotData.success);
            
            if (!screenshotData.success) {
                console.error('❌ Screenshot function reported failure');
                console.error('📊 Error:', screenshotData.error);
                console.error('📊 Details:', screenshotData.details);
                throw new Error(`Screenshot function error: ${screenshotData.error}`);
            }
            
            console.log('✅ Screenshot obtained successfully');
            console.log('📊 Screenshot length:', screenshotData.screenshot.length);
            console.log('📊 Screenshot MB:', (screenshotData.screenshot.length / (1024 * 1024)).toFixed(2));
            
            if (screenshotData.metadata) {
                console.log('📊 === SCREENSHOT METRICS ===');
                console.log('   🎯 Attempts:', screenshotData.metadata.attempts || 1);
                console.log('   ⏱️ Load time:', screenshotData.metadata.loadTime || 'N/A', 'ms');
                console.log('   🚫 Blocked resources:', screenshotData.metadata.blockedResources || 0);
                console.log('   ✅ Allowed resources:', screenshotData.metadata.allowedResources || 0);
                console.log('   📊 Performance:', JSON.stringify(screenshotData.metadata.performanceMetrics, null, 2));
            }
            
        } catch (screenshotError) {
            clearTimeout(screenshotTimeout);
            if (screenshotError.name === 'AbortError') {
                console.error('❌ Screenshot request timed out after 2 minutes');
                throw new Error('Screenshot request timeout: The screenshot function took too long to respond');
            }
            throw screenshotError;
        }
        
        console.log('\n📍 Step 2: Testing OpenAI analysis function...');
        console.log('🤖 Analysis function URL:', `${process.env.URL}/.netlify/functions/analyze`);
        
        const analysisController = new AbortController();
        const analysisTimeout = setTimeout(() => analysisController.abort(), 300000); // 5 minutes
        
        const analysisStart = Date.now();
        
        try {
            const analysisResponse = await fetch(`${process.env.URL}/.netlify/functions/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: testUrl }),
                signal: analysisController.signal
            });
            
            clearTimeout(analysisTimeout);
            const analysisTime = Date.now() - analysisStart;
            
            console.log('⏱️ Analysis request completed in', analysisTime, 'ms');
            console.log('📊 Response status:', analysisResponse.status);
            
            if (!analysisResponse.ok) {
                console.error('❌ Analysis request failed with status:', analysisResponse.status);
                
                let errorDetails;
                try {
                    errorDetails = await analysisResponse.json();
                    console.error('📊 Error details from analysis:', JSON.stringify(errorDetails, null, 2));
                } catch (parseError) {
                    console.error('❌ Failed to parse analysis error response:', parseError.message);
                    errorDetails = { error: 'Failed to get analysis', details: null };
                }
                
                throw new Error(`Analysis failed: ${errorDetails.error || 'Unknown error'}`);
            }
            
            const analysisData = await analysisResponse.json();
            console.log('✅ Analysis response parsed successfully');
            console.log('📊 Success flag:', analysisData.success);
            
            if (!analysisData.success) {
                console.error('❌ Analysis function reported failure');
                console.error('📊 Error:', analysisData.error);
                console.error('📊 Details:', analysisData.details);
                throw new Error(`Analysis function error: ${analysisData.error}`);
            }
            
            console.log('✅ Analysis completed successfully');
            console.log('🎯 Zones found:', analysisData.zones?.length || 0);
            console.log('🌐 Language detected:', analysisData.language);
            console.log('📧 Emails found:', analysisData.emails?.length || 0);
            console.log('🏢 Company name:', analysisData.companyName || 'Not found');
            console.log('📄 Owner info length:', analysisData.ownerInfo?.length || 0);
            console.log('📄 Proposal length:', analysisData.proposal?.length || 0);
            
            if (analysisData.performance) {
                console.log('📊 === ANALYSIS PERFORMANCE ===');
                console.log('   ⏱️ Total time:', analysisData.performance.totalTime, 'ms');
                console.log('   📸 Screenshot time:', analysisData.performance.screenshotTime, 'ms');
                console.log('   🤖 Vision time:', analysisData.performance.visionTime, 'ms');
                console.log('   📧 Scraping time:', analysisData.performance.scrapingTime, 'ms');
                console.log('   🔎 Research time:', analysisData.performance.researchTime, 'ms');
                console.log('   ✍️ Proposal time:', analysisData.performance.proposalTime, 'ms');
            }
            
        } catch (analysisError) {
            clearTimeout(analysisTimeout);
            if (analysisError.name === 'AbortError') {
                console.error('❌ Analysis request timed out after 5 minutes');
                throw new Error('Analysis request timeout: The analysis function took too long to respond');
            }
            throw analysisError;
        }
        
        const totalTime = Date.now() - testStartTime;
        
        console.log('\n========================================');
        console.log('✅ DEBUG TEST COMPLETED SUCCESSFULLY');
        console.log('========================================');
        console.log('⏱️ Total test time:', totalTime, 'ms');
        console.log('⏱️ Total time (minutes):', (totalTime / 1000 / 60).toFixed(2));
        console.log('💾 Final memory usage:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        console.log('🎯 All tests passed successfully!');
        console.log('========================================\n');
        
        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, X-OpenAI-API-Key',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message: 'Debug test completed successfully',
                testUrl: testUrl,
                results: {
                    screenshot: {
                        success: true,
                        time: screenshotTime,
                        size: screenshotData.screenshot.length,
                        metadata: screenshotData.metadata
                    },
                    analysis: {
                        success: true,
                        time: analysisTime,
                        zones: analysisData.zones?.length || 0,
                        language: analysisData.language,
                        emails: analysisData.emails?.length || 0,
                        company: analysisData.companyName,
                        performance: analysisData.performance
                    }
                },
                totalTime: totalTime,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('\n========================================');
        console.error('❌ DEBUG TEST FAILED');
        console.error('========================================');
        console.error('📍 Error step: Unknown - check stack trace');
        console.error('🔍 Error name:', error.name);
        console.error('💬 Error message:', error.message);
        console.error('📋 Error stack:', error.stack);
        console.error('⏰ Error timestamp:', new Date().toISOString());
        console.error('💾 Memory at error:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        console.error('📊 Test elapsed:', Date.now() - testStartTime, 'ms');
        console.error('========================================\n');
        
        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, X-OpenAI-API-Key',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack,
                testUrl: testUrl,
                timestamp: new Date().toISOString()
            })
        };
    }
};