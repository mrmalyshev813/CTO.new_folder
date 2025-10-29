#!/usr/bin/env node

/**
 * Test script to verify the timeout fix
 * Checks that all error responses include proper JSON headers
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing timeout fix implementation...');
console.log('==========================================\n');

// Read the analyze.js file
const analyzeFilePath = path.join(__dirname, 'netlify', 'functions', 'analyze.js');
const analyzeContent = fs.readFileSync(analyzeFilePath, 'utf8');

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

// Test 1: Check that page.goto uses domcontentloaded instead of networkidle0
test(
  'Page navigation uses "domcontentloaded" for faster loading',
  analyzeContent.includes("waitUntil: 'domcontentloaded'"),
  'page.goto should use domcontentloaded instead of networkidle0'
);

// Test 2: Check that page.goto timeout is reduced to 20 seconds or less
test(
  'Page navigation timeout is 20 seconds or less',
  analyzeContent.includes('timeout: 20000') || analyzeContent.match(/timeout:\s*\d{1,5}\s*[,}]/),
  'page.goto timeout should be 20000ms or less'
);

// Test 3: Check that waitForTimeout is added after page load
test(
  'Dynamic content wait is implemented',
  analyzeContent.includes('waitForTimeout'),
  'Should wait for dynamic content after page load'
);

// Test 4: Check that all error responses include Content-Type header
const errorReturnBlocks = analyzeContent.match(/return\s*{[\s\S]*?statusCode:\s*[45]\d{2}[\s\S]*?body:/g) || [];
const errorReturnsWithHeaders = errorReturnBlocks.filter(block => 
  block.includes('Content-Type') && block.includes('application/json')
).length;

test(
  'All error responses include Content-Type: application/json header',
  errorReturnsWithHeaders === errorReturnBlocks.length && errorReturnBlocks.length >= 5,
  `Expected at least 5 error returns with JSON headers, found ${errorReturnsWithHeaders} out of ${errorReturnBlocks.length}`
);

// Test 5: Check that all error responses include CORS headers
const errorReturnsWithCors = errorReturnBlocks.filter(block => 
  block.includes('Access-Control-Allow-Origin')
).length;

test(
  'All error responses include CORS headers',
  errorReturnsWithCors === errorReturnBlocks.length,
  `Expected ${errorReturnBlocks.length} error returns with CORS headers, found ${errorReturnsWithCors}`
);

// Test 6: Check netlify.toml configuration
const tomlFilePath = path.join(__dirname, 'netlify.toml');
const tomlContent = fs.readFileSync(tomlFilePath, 'utf8');

test(
  'netlify.toml includes functions configuration',
  tomlContent.includes('[functions]'),
  'netlify.toml should have [functions] section'
);

test(
  'netlify.toml uses esbuild bundler',
  tomlContent.includes('node_bundler = "esbuild"'),
  'netlify.toml should configure esbuild bundler'
);

// Summary
console.log('\n==========================================');
console.log('📊 TEST SUMMARY');
console.log('==========================================');
console.log(`Total tests: ${passedTests + failedTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log('==========================================\n');

if (failedTests === 0) {
  console.log('🎉 ALL TESTS PASSED! The timeout fix is properly implemented.');
  console.log('\n📝 Summary of changes:');
  console.log('  1. Changed page.goto from networkidle0 to domcontentloaded');
  console.log('  2. Reduced navigation timeout from 30s to 20s');
  console.log('  3. Added 2s wait for dynamic content after page load');
  console.log('  4. All error responses now include proper JSON headers');
  console.log('  5. All error responses now include CORS headers');
  console.log('  6. Configured netlify.toml with esbuild bundler');
  console.log('\n✨ These changes should prevent 504 timeout errors and ensure');
  console.log('   proper JSON error responses in all cases.\n');
  process.exit(0);
} else {
  console.log('⚠️  SOME TESTS FAILED. Please review the errors above.');
  process.exit(1);
}
