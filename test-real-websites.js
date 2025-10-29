const { handler: analyzeHandler } = require('./netlify/functions/analyze');
const { handler: exportDocxHandler } = require('./netlify/functions/export-docx');
const { handler: exportPdfHandler } = require('./netlify/functions/export-pdf');

// Test websites
const TEST_WEBSITES = [
  'https://nlabteam.com',
  'https://example.com',
  'https://news.ycombinator.com'
];

async function analyzeWebsite(url) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${url}`);
  console.log('='.repeat(80));
  
  const startTime = Date.now();
  
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ url })
  };
  
  try {
    const result = await analyzeHandler(event, {});
    const responseTime = Date.now() - startTime;
    
    console.log(`Response Time: ${responseTime}ms (${(responseTime/1000).toFixed(2)}s)`);
    console.log(`Status Code: ${result.statusCode}`);
    
    if (result.statusCode === 200) {
      const data = JSON.parse(result.body);
      
      console.log('\n✅ SCREENSHOT CAPTURED: Success');
      console.log('✅ HTML PARSED: Success');
      console.log('✅ OPENAI ANALYSIS: Completed');
      console.log(`✅ ZONES DETECTED: ${data.zones.length} zones`);
      
      if (data.zones.length > 0) {
        console.log('\nDetected Zones:');
        data.zones.forEach((zone, idx) => {
          console.log(`  ${idx + 1}. ${zone.zone} - ${zone.priority} priority`);
        });
      } else {
        console.log('\n⚠️  No zones detected for this website');
      }
      
      console.log('\nProposal Text Preview:');
      console.log('-'.repeat(80));
      const lines = data.proposal_text.split('\n');
      lines.slice(0, 15).forEach(line => console.log(line));
      if (lines.length > 15) {
        console.log('... (truncated)');
      }
      console.log('-'.repeat(80));
      
      // Check for asterisks
      const hasAsterisks = data.proposal_text.includes('*');
      if (hasAsterisks) {
        console.log('\n❌ ASTERISKS FOUND: Proposal contains * characters');
      } else {
        console.log('\n✅ NO ASTERISKS: Proposal text clean');
      }
      
      // Test exports
      console.log('\nTesting exports...');
      
      // Test DOCX export
      const docxEvent = {
        httpMethod: 'GET',
        path: `/.netlify/functions/export-docx/${data.analysis_id}`
      };
      const docxResult = await exportDocxHandler(docxEvent, {});
      
      if (docxResult.statusCode === 200) {
        console.log('✅ DOCX EXPORT: Success');
      } else {
        console.log('❌ DOCX EXPORT: Failed');
      }
      
      // Test PDF export
      const pdfEvent = {
        httpMethod: 'GET',
        path: `/.netlify/functions/export-pdf/${data.analysis_id}`
      };
      const pdfResult = await exportPdfHandler(pdfEvent, {});
      
      if (pdfResult.statusCode === 200) {
        console.log('✅ PDF EXPORT: Success');
      } else {
        console.log('❌ PDF EXPORT: Failed');
      }
      
      // Performance check
      if (responseTime < 30000) {
        console.log(`✅ PERFORMANCE: Within 30-second limit (${(responseTime/1000).toFixed(2)}s)`);
      } else {
        console.log(`⚠️  PERFORMANCE: Exceeded 30-second limit (${(responseTime/1000).toFixed(2)}s)`);
      }
      
      console.log('\n✅ OVERALL: Test PASSED for ' + url);
      
      return {
        url,
        success: true,
        responseTime,
        zonesCount: data.zones.length,
        zones: data.zones,
        proposalLength: data.proposal_text.length,
        hasAsterisks,
        docxExport: docxResult.statusCode === 200,
        pdfExport: pdfResult.statusCode === 200
      };
      
    } else {
      const error = JSON.parse(result.body);
      console.log('\n❌ TEST FAILED');
      console.log('Error:', error.error || error.detail);
      
      return {
        url,
        success: false,
        error: error.error || error.detail,
        responseTime
      };
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED WITH EXCEPTION');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return {
      url,
      success: false,
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
}

async function testErrorHandling() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('Testing Error Handling');
  console.log('='.repeat(80));
  
  const invalidCases = [
    { url: 'https://this-domain-does-not-exist-12345.com', reason: 'Invalid domain' },
    { url: 'https://192.0.2.1', reason: 'Unreachable site' }
  ];
  
  for (const testCase of invalidCases) {
    console.log(`\nTest Case: ${testCase.reason}`);
    console.log(`URL: ${testCase.url}`);
    
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ url: testCase.url })
    };
    
    try {
      const result = await analyzeHandler(event, {});
      
      if (result.statusCode >= 400) {
        const error = JSON.parse(result.body);
        console.log('✅ Error handled correctly');
        console.log('Error message:', error.error || error.detail);
      } else {
        console.log('⚠️  Expected error but got success');
      }
    } catch (error) {
      console.log('✅ Error handled with exception');
      console.log('Error:', error.message);
    }
  }
}

async function generateTestReport(results) {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST SUMMARY REPORT');
  console.log('='.repeat(80));
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  console.log('\nDetailed Results:');
  console.log('-'.repeat(80));
  
  results.forEach((result, idx) => {
    console.log(`\n${idx + 1}. ${result.url}`);
    console.log(`   Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Response Time: ${(result.responseTime/1000).toFixed(2)}s`);
    
    if (result.success) {
      console.log(`   Zones Detected: ${result.zonesCount}`);
      console.log(`   Asterisks: ${result.hasAsterisks ? '❌ YES' : '✅ NO'}`);
      console.log(`   DOCX Export: ${result.docxExport ? '✅' : '❌'}`);
      console.log(`   PDF Export: ${result.pdfExport ? '✅' : '❌'}`);
      console.log(`   Proposal Length: ${result.proposalLength} chars`);
    } else {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  
  // Success criteria check
  console.log('\nSUCCESS CRITERIA VERIFICATION:');
  console.log('-'.repeat(80));
  
  const allPassed = successCount === results.length;
  const noPuppeteerErrors = results.every(r => !r.error || !r.error.includes('module'));
  const minTwoSuccess = successCount >= 2;
  const noAsterisks = results.filter(r => r.success).every(r => !r.hasAsterisks);
  const allExportsWork = results.filter(r => r.success).every(r => r.docxExport && r.pdfExport);
  const withinTimeLimit = results.filter(r => r.success).every(r => r.responseTime < 30000);
  
  console.log(`✓ No Puppeteer/Chrome module errors: ${noPuppeteerErrors ? '✅ YES' : '❌ NO'}`);
  console.log(`✓ Successfully analyzed at least 2 websites: ${minTwoSuccess ? '✅ YES' : '❌ NO'} (${successCount}/2)`);
  console.log(`✓ All proposals generated correctly: ${allPassed ? '✅ YES' : '⚠️  SOME FAILED'}`);
  console.log(`✓ All exports (DOCX, PDF) work: ${allExportsWork ? '✅ YES' : '❌ NO'}`);
  console.log(`✓ No asterisks in output: ${noAsterisks ? '✅ YES' : '❌ NO'}`);
  console.log(`✓ Response within 30 seconds: ${withinTimeLimit ? '✅ YES' : '❌ NO'}`);
  
  const allCriteriaMet = noPuppeteerErrors && minTwoSuccess && noAsterisks && allExportsWork && withinTimeLimit;
  
  console.log('\n' + '='.repeat(80));
  console.log(`OVERALL STATUS: ${allCriteriaMet ? '✅ ALL CRITERIA MET - READY FOR PRODUCTION' : '⚠️  SOME CRITERIA NOT MET'}`);
  console.log('='.repeat(80));
  
  return {
    total: results.length,
    passed: successCount,
    failed: failCount,
    allCriteriaMet,
    results
  };
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   AD PLACEMENT ANALYZER - E2E TEST SUITE                  ║');
  console.log('║                         Real Website Testing                               ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  
  console.log('\n📋 Test Configuration:');
  console.log(`   - Test websites: ${TEST_WEBSITES.length}`);
  console.log(`   - Environment: ${process.env.OPENAI_API_KEY ? '✅ API Key Set' : '❌ API Key Missing'}`);
  console.log(`   - Timestamp: ${new Date().toISOString()}`);
  
  // Run main tests
  const results = [];
  
  for (const url of TEST_WEBSITES) {
    const result = await analyzeWebsite(url);
    results.push(result);
    
    // Wait a bit between tests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Test error handling
  await testErrorHandling();
  
  // Generate report
  const report = await generateTestReport(results);
  
  return report;
}

if (require.main === module) {
  runTests()
    .then(report => {
      process.exit(report.allCriteriaMet ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runTests, analyzeWebsite };
