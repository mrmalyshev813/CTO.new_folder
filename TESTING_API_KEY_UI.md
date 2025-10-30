# Testing API Key Configuration UI

## Test Cases

### 1. First-Time User Experience
**Test**: User visits the site for the first time
- ✅ Welcome message is displayed in the results area
- ✅ Instructions shown with link to OpenAI platform
- ✅ "Настроить API ключ" button is visible
- ✅ Button shows "🔌 Подключить API OpenAI" (blue, disconnected state)
- ✅ Console shows "ℹ️ No API key found. Please configure your OpenAI API key."

### 2. API Key Modal
**Test**: Click the API key button in bottom-right corner
- ✅ Modal opens with current API key value
- ✅ Input field is of type "password" (masked)
- ✅ Modal shows instructions and link to OpenAI platform
- ✅ ESC key closes the modal
- ✅ Click outside modal closes it
- ✅ Cancel button closes the modal
- ✅ Close (×) button closes the modal

### 3. API Key Validation
**Test**: Enter invalid API key
- ✅ Keys not starting with "sk-" are rejected
- ✅ Alert message shown: "API ключ должен начинаться с 'sk-'"
- ✅ Modal stays open for correction

**Test**: Enter valid API key
- ✅ Key is saved to localStorage
- ✅ Modal closes automatically
- ✅ Button state updates to "✅ API Подключен"
- ✅ Console logs: "✅ API key saved"

### 4. Persistence
**Test**: Refresh the page
- ✅ API key persists in localStorage
- ✅ Button shows correct connection state
- ✅ Saved key is loaded into input field when modal is opened

### 5. API Key Usage in Requests
**Test**: Make a website analysis request
- ✅ API key is retrieved from localStorage
- ✅ API key is sent in `X-OpenAI-API-Key` header
- ✅ Backend receives and uses the API key
- ✅ OpenAI API calls succeed with user's key

### 6. Error Handling - Missing API Key
**Test**: Clear localStorage and try to analyze a website
- ✅ Pre-analysis validation catches missing key
- ✅ Error message shown: "API ключ не настроен..."
- ✅ Error includes actionable button: "🔑 Настроить API ключ"
- ✅ Clicking button opens the API key modal

### 7. Backend Validation
**Test**: Send request without API key header
- ✅ Backend checks for API key
- ✅ Returns HTTP 400 if missing
- ✅ Error message: "The OPENAI_API_KEY is missing..."
- ✅ Falls back to environment variable if header not present

### 8. CORS Preflight
**Test**: Browser sends OPTIONS request
- ✅ Backend handles OPTIONS method
- ✅ Returns proper CORS headers
- ✅ Includes `X-OpenAI-API-Key` in `Access-Control-Allow-Headers`

## Manual Testing Steps

### Step 1: Initial Setup (First Time)
1. Open index.html in a browser
2. Check browser console for: "ℹ️ No API key found. Please configure your OpenAI API key."
3. Verify welcome message appears in results area
4. Verify button shows "🔌 Подключить API OpenAI"

### Step 2: Open Settings Modal
1. Click the API key button (bottom-right)
2. Verify modal opens
3. Check that input field contains the API key
4. Try closing with ESC, clicking outside, or cancel button

### Step 3: Test Invalid Key
1. Open modal
2. Enter "invalid-key"
3. Click "Сохранить"
4. Verify alert message appears
5. Modal should remain open

### Step 4: Test Valid Key
1. Open modal
2. Enter a valid key starting with "sk-"
3. Click "Сохранить"
4. Verify modal closes
5. Check button state updates

### Step 5: Test Analysis
1. Enter a website URL (e.g., "google.com")
2. Click "Найти"
3. Check browser Network tab:
   - Request should include `X-OpenAI-API-Key` header
   - Value should match saved key
4. Verify analysis completes successfully

### Step 6: Test Error Handling
1. Open browser DevTools
2. Run: `localStorage.removeItem('openai_api_key')`
3. Refresh page
4. Try to analyze a website
5. Verify error message with setup button appears
6. Click the setup button
7. Verify modal opens

### Step 7: Test Persistence
1. Save a new API key
2. Refresh the page
3. Open modal
4. Verify key is still there
5. Check button state is correct

## Expected Console Logs

### On Page Load (with saved key):
```
✅ API key loaded from localStorage
```

### On Page Load (first time):
```
ℹ️ No API key found. Please configure your OpenAI API key.
⚠️ API key not configured
```

### On Save:
```
✅ API key saved
```

### On Analysis Start:
```
🔍 Starting analysis for: https://example.com
```

### On Backend (with key):
```
🔍 === ANALYSIS START ===
URL: https://example.com
✅ API key found
```

### On Backend (missing key):
```
❌ API key is missing
```

## Browser Compatibility

Tested and working in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

Features used:
- localStorage API (supported in all modern browsers)
- Fetch API (supported in all modern browsers)
- ES6+ JavaScript (supported in all modern browsers)

## Security Verification

- ✅ API key stored in localStorage (client-side only)
- ✅ Input field type is "password" (masked display)
- ✅ Key not logged to console
- ✅ HTTPS required for production
- ✅ CORS properly configured
- ✅ No server-side storage of user's API key

## Performance

- ✅ No additional network requests for API key management
- ✅ localStorage operations are synchronous and fast
- ✅ No impact on page load time
- ✅ No impact on analysis performance
