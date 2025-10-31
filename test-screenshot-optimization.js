#!/usr/bin/env node

/**
 * Test script to verify screenshot optimization for Vision API
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Screenshot Optimization for Vision API...');
console.log('====================================================\n');

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
const packagePath = path.join(__dirname, 'package.json');

const screenshotContent = fs.readFileSync(screenshotPath, 'utf8');
const packageContent = fs.readFileSync(packagePath, 'utf8');
const packageJson = JSON.parse(packageContent);

// Test package.json changes
console.log('📦 Testing package.json changes:\n');

test(
  'Sharp library added to dependencies',
  packageJson.dependencies.sharp !== undefined,
  'Sharp should be added to dependencies for image optimization'
);

test(
  'Sharp version is correct (^0.33.0 or compatible)',
  packageJson.dependencies.sharp && packageJson.dependencies.sharp.includes('0.33'),
  'Sharp version should be ^0.33.0 or compatible'
);

// Test screenshot.js changes
console.log('\n📸 Testing screenshot.js changes:\n');

test(
  'Sharp library imported',
  screenshotContent.includes("const sharp = require('sharp');"),
  'Sharp should be imported at the top of the file'
);

test(
  'Screenshot uses JPEG format instead of PNG',
  screenshotContent.includes("type: 'jpeg'") && 
  !screenshotContent.match(/type:\s*['"]png['"]/),
  'Screenshot should use JPEG format, not PNG'
);

test(
  'Screenshot quality is set to 80%',
  screenshotContent.includes('quality: 80'),
  'JPEG quality should be set to 80%'
);

test(
  'Screenshot uses fullPage: false (viewport only)',
  screenshotContent.includes('fullPage: false'),
  'Screenshot should capture viewport only (fullPage: false)'
);

test(
  'Optimization function exists',
  screenshotContent.includes('async function optimizeScreenshotForVision'),
  'optimizeScreenshotForVision function should be defined'
);

test(
  'Optimization function is called',
  screenshotContent.includes('await optimizeScreenshotForVision(screenshot)'),
  'optimizeScreenshotForVision should be called with the screenshot'
);

test(
  'Data URL format changed to JPEG',
  screenshotContent.includes('data:image/jpeg;base64') &&
  !screenshotContent.match(/data:image\/png;base64/),
  'Data URL should use image/jpeg, not image/png'
);

test(
  'Size checking logic exists',
  screenshotContent.includes('initialSizeMB') && screenshotContent.includes('maxSizeMB'),
  'Size checking logic should exist to determine if compression is needed'
);

test(
  'Sharp resize operation exists',
  screenshotContent.includes('.resize(1280, 1024'),
  'Sharp resize to 1280x1024 should be implemented'
);

test(
  'Sharp JPEG compression with quality exists',
  screenshotContent.includes('.jpeg({') && screenshotContent.includes('quality: targetQuality'),
  'Sharp JPEG compression with dynamic quality should be implemented'
);

test(
  'Logging for original size exists',
  screenshotContent.includes('Исходный размер скриншота'),
  'Should log the original screenshot size'
);

test(
  'Logging for compressed size exists',
  screenshotContent.includes('Сжато до'),
  'Should log the compressed screenshot size'
);

// Summary
console.log('\n====================================================');
console.log('📊 Test Summary:');
console.log(`   ✅ Passed: ${passedTests}`);
console.log(`   ❌ Failed: ${failedTests}`);
console.log(`   Total: ${passedTests + failedTests}`);
console.log('====================================================\n');

if (failedTests === 0) {
  console.log('🎉 All tests passed! Screenshot optimization is correctly implemented.');
  process.exit(0);
} else {
  console.log('⚠️ Some tests failed. Please review the implementation.');
  process.exit(1);
}
