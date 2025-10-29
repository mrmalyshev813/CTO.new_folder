#!/usr/bin/env node

/**
 * Runtime Test Suite for Spline Search Interface
 * This script starts the dev server and performs runtime checks
 */

const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting Runtime Tests for Spline Search Interface\n');
console.log('=' .repeat(60));

let devServer;
const PORT = 3000;
const HOST = 'localhost';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkServerRunning() {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/',
      method: 'GET',
      timeout: 2000,
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function testAPIEndpoint(query) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query });
    
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 30000,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: result,
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  let testsPassed = 0;
  let testsFailed = 0;

  console.log('\n🌐 Server Availability Tests\n');

  console.log('Checking if server is running...');
  const serverRunning = await checkServerRunning();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on port 3000');
    console.log('\n💡 To run these tests:');
    console.log('   1. Open a terminal and run: npm run dev');
    console.log('   2. Wait for the server to start');
    console.log('   3. Run this test script again: node test-runtime.js\n');
    process.exit(1);
  }

  console.log('✅ Server is running on http://localhost:3000\n');
  testsPassed++;

  console.log('🧪 API Endpoint Tests\n');

  try {
    console.log('Test 1: Simple query...');
    const result1 = await testAPIEndpoint('What is AI?');
    
    if (result1.statusCode === 200) {
      console.log('✅ API responds with 200 status');
      testsPassed++;
      
      if (result1.data.result && result1.data.result.length > 0) {
        console.log('✅ API returns non-empty result');
        console.log(`   Response preview: "${result1.data.result.substring(0, 80)}..."`);
        testsPassed++;
      } else {
        console.log('❌ API returned empty result');
        testsFailed++;
      }
    } else {
      console.log(`❌ API responded with status ${result1.statusCode}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ API request failed: ${error.message}`);
    testsFailed++;
  }

  await sleep(2000);

  try {
    console.log('\nTest 2: Empty query validation...');
    const result2 = await testAPIEndpoint('');
    
    if (result2.statusCode === 400) {
      console.log('✅ API correctly rejects empty queries with 400 status');
      testsPassed++;
    } else {
      console.log(`⚠️  API responded with status ${result2.statusCode} instead of 400`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ Empty query test failed: ${error.message}`);
    testsFailed++;
  }

  await sleep(2000);

  try {
    console.log('\nTest 3: Complex query...');
    const result3 = await testAPIEndpoint('Explain quantum computing in simple terms');
    
    if (result3.statusCode === 200 && result3.data.result) {
      console.log('✅ API handles complex queries successfully');
      testsPassed++;
      
      if (result3.data.result.length > 50) {
        console.log('✅ API returns detailed response');
        testsPassed++;
      } else {
        console.log('⚠️  Response seems too short');
        testsFailed++;
      }
    } else {
      console.log('❌ Complex query test failed');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ Complex query test failed: ${error.message}`);
    testsFailed++;
  }

  await sleep(2000);

  try {
    console.log('\nTest 4: Special characters handling...');
    const result4 = await testAPIEndpoint('What is 2+2? 🤖');
    
    if (result4.statusCode === 200) {
      console.log('✅ API handles special characters and emojis');
      testsPassed++;
    } else {
      console.log('❌ Special characters test failed');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ Special characters test failed: ${error.message}`);
    testsFailed++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Runtime Test Summary\n');
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  
  const total = testsPassed + testsFailed;
  const successRate = ((testsPassed / total) * 100).toFixed(1);
  console.log(`\n📈 Success Rate: ${successRate}%\n`);

  if (testsFailed === 0) {
    console.log('🎉 All runtime tests passed!\n');
    console.log('✨ The application is fully functional and ready to use.\n');
    console.log('📝 Next steps:');
    console.log('   • Open http://localhost:3000 in your browser');
    console.log('   • Test the search interface manually');
    console.log('   • Verify the Spline 3D scene loads correctly');
    console.log('   • Check responsive design on different screen sizes\n');
  } else {
    console.log(`⚠️  ${testsFailed} test(s) failed.\n`);
    console.log('Please check the API integration and try again.\n');
  }
}

async function main() {
  try {
    await runTests();
  } catch (error) {
    console.error('\n❌ Fatal error during testing:', error.message);
    process.exit(1);
  }
}

main();
