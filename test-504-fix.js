#!/usr/bin/env node

/**
 * Test script to verify 504 Gateway Timeout fixes
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing 504 Gateway Timeout fixes...');
console.log('==========================================\n');

let passedTests = 0;
let failedTests = 0;

function test(name, condition, errorMessage) {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } else {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   ${errorMessage}`);
    failedTests++;
  }
}

// Read files
const screenshotPath = path.join(__dirname, 'netlify', 'functions', 'screenshot.js');
const analyzePath = path.join(__dirname, 'netlify', 'functions', 'analyze.js');

const screenshotContent = fs.readFileSync(screenshotPath, 'utf8');
const analyzeContent = fs.readFileSync(analyzePath, 'utf8');

// Test screenshot.js fixes
console.log('📸 Testing screenshot.js fixes:\n');

test(
  'Screenshot uses "domcontentloaded" instead of "networkidle0"',
  screenshotContent.includes("waitUntil: 'domcontentloaded'") && 
  !screenshotContent.includes("waitUntil: 'networkidle0'"),
  'Should use domcontentloaded for faster page loading'
);

test(
  'Screenshot timeout reduced to 15 seconds',
  screenshotContent.includes('timeout: 15000'),
  'Timeout should be 15000ms'
);

test(
  'Screenshot waits for dynamic content after page load',
  screenshotContent.includes('await new Promise') && 
  screenshotContent.includes('setTimeout(resolve, 2000)'),
  'Should wait 2 seconds for dynamic content to render'
);

// Test analyze.js fixes
console.log('\n📊 Testing analyze.js fixes:\n');

test(
  'Screenshot fetch has timeout with AbortController',
  analyzeContent.includes('screenshotController') && 
  analyzeContent.includes('AbortController') &&
  analyzeContent.includes('signal: screenshotController.signal'),
  'Should use AbortController for screenshot fetch timeout'
);

test(
  'Screenshot fetch timeout is 20 seconds',
  analyzeContent.includes('screenshotController.abort(), 20000'),
  'Screenshot fetch should timeout after 20 seconds'
);

test(
  'Scraping has timeout with AbortController',
  analyzeContent.includes('scrapeWebsite(url)') && 
  analyzeContent.match(/async function scrapeWebsite[\s\S]{0,500}AbortController/),
  'Should use AbortController for scraping timeout'
);

test(
  'Scraping timeout is 10 seconds',
  analyzeContent.match(/scrapeWebsite[\s\S]{0,500}abort\(\), 10000/),
  'Scraping should timeout after 10 seconds'
);

test(
  'Error handling detects AbortError for timeouts',
  analyzeContent.includes("error.name === 'AbortError'") || 
  analyzeContent.includes("error.message.includes('abort')"),
  'Should detect and handle AbortError specifically'
);

test(
  'Timeout errors return 504 status code',
  analyzeContent.includes('statusCode = 504'),
  'Should return proper 504 status code for timeout errors'
);

test(
  'User-friendly timeout error message',
  analyzeContent.includes('Request timeout') || 
  analyzeContent.includes('took too long'),
  'Should provide user-friendly error message for timeouts'
);

// Summary
console.log('\n==========================================');
console.log('📊 TEST SUMMARY');
console.log('==========================================');
console.log(`Total tests: ${passedTests + failedTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log('==========================================\n');

if (failedTests === 0) {
  console.log('🎉 ALL TESTS PASSED! The 504 Gateway Timeout fix is properly implemented.\n');
  console.log('📝 Summary of fixes:');
  console.log('  ✅ Screenshot.js:');
  console.log('     • Changed waitUntil from "networkidle0" to "domcontentloaded"');
  console.log('     • Reduced timeout from 30s to 15s');
  console.log('     • Added 2s wait for dynamic content after page load');
  console.log('  ✅ Analyze.js:');
  console.log('     • Added 20s timeout for screenshot fetch');
  console.log('     • Added 10s timeout for website scraping');
  console.log('     • Improved error handling for timeout errors');
  console.log('     • Returns proper 504 status code with user-friendly message');
  console.log('\n✨ These changes should prevent 504 timeout errors!\n');
  process.exit(0);
} else {
  console.log('⚠️  SOME TESTS FAILED. Please review the errors above.\n');
  process.exit(1);
}
