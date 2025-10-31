exports.handler = async () => {
    console.log('\n🧪 === DEBUG TEST START ===\n');
    
    const testUrl = 'https://example.com';
    
    try {
        // Вызвать screenshot function
        console.log('Step 1: Testing screenshot...');
        const screenshotResult = await fetch(`${process.env.URL}/.netlify/functions/screenshot`, {
            method: 'POST',
            body: JSON.stringify({ url: testUrl })
        });
        
        const screenshotData = await screenshotResult.json();
        console.log('Screenshot result:', screenshotData.success ? '✅ OK' : '❌ FAILED');
        
        if (!screenshotData.success) {
            throw new Error('Screenshot failed: ' + JSON.stringify(screenshotData));
        }
        
        // Вызвать analyze function
        console.log('Step 2: Testing analyze...');
        const analyzeResult = await fetch(`${process.env.URL}/.netlify/functions/analyze`, {
            method: 'POST',
            body: JSON.stringify({ url: testUrl })
        });
        
        const analyzeData = await analyzeResult.json();
        console.log('Analyze result:', analyzeData.success ? '✅ OK' : '❌ FAILED');
        
        console.log('\n🎉 === ALL TESTS PASSED ===\n');
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                screenshot: screenshotData,
                analyze: analyzeData
            })
        };
        
    } catch (error) {
        console.error('\n❌ === TEST FAILED ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack
            })
        };
    }
};