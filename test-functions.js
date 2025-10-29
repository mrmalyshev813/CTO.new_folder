const { handler: analyzeHandler } = require('./netlify/functions/analyze');
const { handler: exportDocxHandler } = require('./netlify/functions/export-docx');
const { handler: exportPdfHandler } = require('./netlify/functions/export-pdf');

async function testAnalyze() {
  console.log('\n=== Testing Analyze Function ===\n');
  
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ url: 'https://example.com' })
  };
  
  try {
    const result = await analyzeHandler(event, {});
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      const data = JSON.parse(result.body);
      console.log('✅ Analysis successful!');
      console.log('Analysis ID:', data.analysis_id);
      console.log('Zones found:', data.zones.length);
      console.log('Proposal text length:', data.proposal_text.length);
      console.log('\nZones:', JSON.stringify(data.zones, null, 2));
      return data.analysis_id;
    } else {
      console.log('❌ Analysis failed');
      console.log('Response:', result.body);
      return null;
    }
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    return null;
  }
}

async function testExportDocx(analysisId) {
  console.log('\n=== Testing DOCX Export ===\n');
  
  if (!analysisId) {
    console.log('⚠️  Skipping DOCX export test (no analysis ID)');
    return;
  }
  
  const event = {
    httpMethod: 'GET',
    path: `/.netlify/functions/export-docx/${analysisId}`
  };
  
  try {
    const result = await exportDocxHandler(event, {});
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ DOCX export successful!');
      console.log('Content-Type:', result.headers['Content-Type']);
    } else {
      console.log('❌ DOCX export failed');
      console.log('Response:', result.body);
    }
  } catch (error) {
    console.error('❌ Error during DOCX export:', error.message);
  }
}

async function testExportPdf(analysisId) {
  console.log('\n=== Testing PDF Export ===\n');
  
  if (!analysisId) {
    console.log('⚠️  Skipping PDF export test (no analysis ID)');
    return;
  }
  
  const event = {
    httpMethod: 'GET',
    path: `/.netlify/functions/export-pdf/${analysisId}`
  };
  
  try {
    const result = await exportPdfHandler(event, {});
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ PDF export successful!');
      console.log('Content-Type:', result.headers['Content-Type']);
    } else {
      console.log('❌ PDF export failed');
      console.log('Response:', result.body);
    }
  } catch (error) {
    console.error('❌ Error during PDF export:', error.message);
  }
}

async function runTests() {
  console.log('======================================');
  console.log('  Netlify Functions Test Suite');
  console.log('======================================');
  
  const analysisId = await testAnalyze();
  
  if (analysisId) {
    await testExportDocx(analysisId);
    await testExportPdf(analysisId);
  }
  
  console.log('\n======================================');
  console.log('  Test Suite Complete');
  console.log('======================================\n');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
