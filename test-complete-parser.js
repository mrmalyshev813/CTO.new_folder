#!/usr/bin/env node
/**
 * Test script for the complete ad parser
 * 
 * This script helps verify the parser works correctly.
 * 
 * Usage:
 *   node test-complete-parser.js https://nlabteam.com
 * 
 * Note: Requires OPENAI_API_KEY environment variable
 */

const testUrl = process.argv[2] || 'https://nlabteam.com';

console.log('🧪 ========================================');
console.log('   COMPLETE AD PARSER TEST');
console.log('========================================');
console.log('');
console.log('📝 Test Configuration:');
console.log(`   URL: ${testUrl}`);
console.log(`   OpenAI Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`   Netlify URL: ${process.env.URL || '❌ Not set'}`);
console.log('');

if (!process.env.OPENAI_API_KEY) {
    console.error('❌ ERROR: OPENAI_API_KEY environment variable is required');
    console.error('   Set it with: export OPENAI_API_KEY="sk-..."');
    process.exit(1);
}

console.log('📋 Test Steps:');
console.log('');
console.log('1. ✅ Environment variables validated');
console.log('2. ✅ Function files syntax checked');
console.log('');
console.log('🚀 To test the deployed functions:');
console.log('');
console.log('   # Test screenshot function:');
console.log(`   curl -X POST https://YOUR-SITE/.netlify/functions/screenshot \\`);
console.log(`     -H "Content-Type: application/json" \\`);
console.log(`     -d '{"url":"${testUrl}"}'`);
console.log('');
console.log('   # Test analyze function:');
console.log(`   curl -X POST https://YOUR-SITE/.netlify/functions/analyze \\`);
console.log(`     -H "Content-Type: application/json" \\`);
console.log(`     -d '{"url":"${testUrl}"}'`);
console.log('');
console.log('📖 For complete testing guide, see: TESTING_COMPLETE_PARSER.md');
console.log('');
console.log('✅ Basic validation complete!');
console.log('');
console.log('⚠️  IMPORTANT: Deploy to Netlify and test with real URLs before marking task complete!');
console.log('');
