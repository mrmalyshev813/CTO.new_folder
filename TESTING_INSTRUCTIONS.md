# Testing Instructions - Critical Crawling Fix

## 🔴 IMPORTANT: This fix MUST be tested before merge!

This document provides instructions for testing the crawling error fix.

## Changes Made

### 1. Enhanced Crawling with Fallback Mechanism
- **Primary Method**: Puppeteer with Chromium (full screenshot capability)
- **Fallback Method**: Screenshot service API (thum.io) + direct HTML fetch
- If Puppeteer fails in the Netlify Functions environment, the system automatically falls back to the screenshot service

### 2. Comprehensive Logging
Added detailed logging at every step:
- Function invocation details
- URL normalization and validation
- Browser launch and navigation
- Screenshot capture
- HTML extraction
- OpenAI API calls
- Error details with full stack traces

### 3. Automated Testing
Added a test button in the UI that runs automated tests on 4 websites:
- example.com
- google.com
- habr.com
- nlabteam.com

### 4. Better Error Handling
- Detailed error messages for users
- Developer details in expandable section
- Timeout handling
- Screenshot verification

## Local Testing

### Prerequisites
1. Node.js 18+ installed
2. OpenAI API key configured

### Setup
```bash
# Install dependencies
npm install

# Set up environment variables
# For local testing with Netlify CLI:
export OPENAI_API_KEY="your-api-key-here"

# Or create a .env file (for Netlify Functions):
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

### Run Tests

#### Option 1: Using the UI Test Button
1. Start a local server:
   ```bash
   # Using Netlify CLI (recommended):
   netlify dev
   
   # Or using any HTTP server:
   python3 -m http.server 8080
   ```

2. Open `http://localhost:8888` (Netlify) or `http://localhost:8080`

3. Click the **"🧪 Run Automated Tests"** button in the bottom-left corner

4. Open the browser console (F12) to see detailed test results

5. **Acceptance Criteria**: All 4 tests must pass (4/4)

#### Option 2: Using Browser Console
1. Open the site in your browser
2. Open developer console (F12)
3. Run: `runAutomatedTests()`
4. Watch the detailed output

#### Option 3: Manual Testing
1. Open the site
2. Enter each test URL one by one:
   - `example.com`
   - `google.com`
   - `habr.com`
   - `nlabteam.com`
3. Click "Найти" and wait for results
4. Verify:
   - ✅ No errors in console
   - ✅ Results are displayed
   - ✅ Zones are found
   - ✅ Proposal is generated
   - ✅ Completes in < 30 seconds

## Production Testing (Netlify)

### Before Deploying
1. Ensure OPENAI_API_KEY is set in Netlify environment variables:
   - Go to Netlify Dashboard
   - Site settings → Environment variables
   - Add `OPENAI_API_KEY` with your API key

2. Deploy to staging/preview first

### After Deploying to Production
1. Visit the production URL
2. Run automated tests using the test button
3. Check Netlify Functions logs:
   - Netlify Dashboard → Functions → analyze
   - Look for detailed logs with timestamps
   - Verify no errors

4. Test manually with all 4 URLs

5. **CRITICAL**: Do NOT mark task as complete until:
   - ✅ All 4 automated tests pass
   - ✅ No errors in production logs
   - ✅ Manual testing confirms it works
   - ✅ User confirms functionality

## Troubleshooting

### If Puppeteer fails:
Check the logs for:
- Chromium executable path
- Browser launch errors
- System dependency errors

The system should automatically fall back to screenshot service.

### If Screenshot Service fails:
Check the logs for:
- Screenshot URL verification
- Fetch timeout errors
- HTTP response codes

### If Both Methods Fail:
1. Check network connectivity
2. Verify the target URL is accessible
3. Check Netlify Functions logs for system errors
4. Verify OpenAI API key is set

### Common Issues:

**Issue**: "OpenAI API key is not configured"
**Solution**: Set OPENAI_API_KEY in Netlify environment variables

**Issue**: "Navigation timed out"
**Solution**: The site is too slow. The fallback should handle this. Check if fallback is working.

**Issue**: "Chromium dependencies are missing"
**Solution**: This should not happen on Netlify, but if it does, the fallback will handle it.

## Verification Checklist

### Before Marking as Complete:
- [ ] All 4 automated tests pass (4/4)
- [ ] Manual test on nlabteam.com succeeds
- [ ] Manual test on example.com succeeds
- [ ] Manual test on google.com succeeds
- [ ] Manual test on habr.com succeeds
- [ ] No errors in browser console
- [ ] No errors in Netlify Functions logs
- [ ] Response time < 30 seconds for all tests
- [ ] Results are meaningful (not generic)
- [ ] User has tested and confirmed

## Monitoring

After deployment, monitor:
1. Netlify Functions logs for any errors
2. OpenAI API usage (costs)
3. Function execution times
4. Error rates

## Rollback Plan

If issues occur in production:
1. Check Netlify Functions logs immediately
2. If critical, revert to previous deployment
3. Debug locally using the test suite
4. Fix and redeploy

## Success Criteria

✅ **Definition of Done**:
1. All automated tests pass (4/4)
2. No errors in production logs
3. Manual testing confirms all URLs work
4. Response times < 30 seconds
5. User confirmation received
6. No regressions in other functionality

## Contact

If you encounter issues during testing, check:
1. Browser console for frontend errors
2. Netlify Functions logs for backend errors
3. Network tab for API call details
4. The detailed logging in console output
