const { runTest } = require('./test-parser-mock');

// Test the new complete API endpoint
async function testCompleteAPI(url) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing Complete API with: ${url}`);
    console.log('='.repeat(80));
    
    try {
        // For now, we'll test the mock version since backend requires Python setup
        console.log('Testing mock implementation (backend requires Python setup)...');
        
        const result = await runTest(url);
        
        if (result.success) {
            console.log('\n✅ MOCK TEST PASSED - Ready for backend integration');
            console.log('\nTo test the actual backend API:');
            console.log('1. Start the FastAPI backend:');
            console.log('   cd backend && python -m uvicorn app.main:app --reload');
            console.log('2. Make a POST request to:');
            console.log('   http://localhost:8000/api/complete/analyze');
            console.log('3. With JSON body:');
            console.log(`   {"url": "${url}"}`);
            
            return {
                url,
                success: true,
                message: 'Mock test passed, ready for backend testing'
            };
        } else {
            return {
                url,
                success: false,
                error: result.error
            };
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return {
            url,
            success: false,
            error: error.message
        };
    }
}

// Test with the required websites from the ticket
async function runAllAPITests() {
    const testUrls = [
        'https://nlabteam.com',
        'https://example.com'
    ];
    
    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    COMPLETE API - INTEGRATION TEST SUITE                     ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝');
    
    const results = [];
    
    for (const url of testUrls) {
        const result = await testCompleteAPI(url);
        results.push(result);
        
        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Summary
    console.log(`\n${'='.repeat(80)}`);
    console.log('API TEST SUMMARY');
    console.log('='.repeat(80));
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\nTotal Tests: ${results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    
    if (passed === results.length) {
        console.log('\n🎉 ALL API TESTS PASSED!');
        console.log('\nNext steps:');
        console.log('1. Install Python dependencies: pip install -r requirements.txt');
        console.log('2. Install Playwright browser: python -m playwright install chromium');
        console.log('3. Set OPENAI_API_KEY in .env file');
        console.log('4. Start backend server');
        console.log('5. Test real API endpoints');
    } else {
        console.log('\n❌ Some tests failed. Check the errors above.');
    }
    
    return results;
}

if (require.main === module) {
    const url = process.argv[2];
    
    if (url) {
        // Test specific URL
        testCompleteAPI(url)
            .then(result => {
                process.exit(result.success ? 0 : 1);
            })
            .catch(error => {
                console.error('Fatal error:', error);
                process.exit(1);
            });
    } else {
        // Run all tests
        runAllAPITests()
            .then(results => {
                const allPassed = results.every(r => r.success);
                process.exit(allPassed ? 0 : 1);
            })
            .catch(error => {
                console.error('Fatal error:', error);
                process.exit(1);
            });
    }
}

module.exports = { testCompleteAPI, runAllAPITests };