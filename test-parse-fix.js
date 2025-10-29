#!/usr/bin/env node

/**
 * Test script for website parsing fix
 * Tests the analyze function on multiple real websites
 */

const testUrls = [
  'https://nlabteam.com',
  'https://example.com',
  'https://habr.com',
  'https://vc.ru'
];

console.log('🧪 Starting automated tests for website parsing fix...');
console.log('==========================================\n');

async function testWebsite(url) {
  console.log(`\n📍 Testing: ${url}`);
  console.log('-------------------------------------------');
  
  const startTime = Date.now();
  
  try {
    // Normalize URL
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    console.log('✅ URL normalized:', normalizedUrl);
    
    // Validate URL format
    try {
      new URL(normalizedUrl);
      console.log('✅ URL format is valid');
    } catch (e) {
      throw new Error(`Invalid URL format: ${e.message}`);
    }
    
    // Test the analyze endpoint
    console.log('📡 Sending request to analyze function...');
    
    const response = await fetch('http://localhost:8888/.netlify/functions/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: normalizedUrl })
    });
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Server error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    const duration = Date.now() - startTime;
    
    console.log('✅ Analysis completed successfully');
    console.log('⏱️  Duration:', duration, 'ms');
    console.log('📊 Zones found:', data.zones ? data.zones.length : 0);
    
    if (data.zones && data.zones.length > 0) {
      console.log('\nZones:');
      data.zones.forEach((zone, idx) => {
        console.log(`  ${idx + 1}. ${zone.zone} - ${zone.priority} priority`);
      });
    }
    
    console.log('\n✅ TEST PASSED for', url);
    return {
      url,
      success: true,
      duration,
      zones: data.zones ? data.zones.length : 0
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ TEST FAILED for', url);
    console.error('Error:', error.message);
    
    return {
      url,
      success: false,
      duration,
      error: error.message
    };
  }
}

async function runAllTests() {
  const results = [];
  
  for (const url of testUrls) {
    const result = await testWebsite(url);
    results.push(result);
    
    // Wait a bit between tests to avoid rate limiting
    if (testUrls.indexOf(url) < testUrls.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Print summary
  console.log('\n\n==========================================');
  console.log('📊 TEST SUMMARY');
  console.log('==========================================\n');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const duration = `${result.duration}ms`;
    const details = result.success 
      ? `${result.zones} zones found`
      : `Error: ${result.error}`;
    
    console.log(`${status} | ${result.url}`);
    console.log(`       Duration: ${duration}`);
    console.log(`       ${details}`);
    console.log('');
  });
  
  console.log('==========================================');
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('==========================================\n');
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! The parsing fix is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
