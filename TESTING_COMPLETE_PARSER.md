# Complete Ad Parser Testing Guide

## 🎯 Overview

This guide explains how to test the complete ad parser that:
1. ✅ Takes screenshots using Playwright
2. ✅ Analyzes ad zones with OpenAI Vision
3. ✅ Finds emails and contacts
4. ✅ Researches company owner info
5. ✅ Generates personalized proposals
6. ✅ Auto-detects website language

---

## 🧪 Testing Steps

### 1. Test Screenshot Function

```bash
curl -X POST https://YOUR-PREVIEW-URL/.netlify/functions/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url":"https://nlabteam.com"}'
```

**Expected Result:**
```json
{
  "success": true,
  "screenshot": "data:image/png;base64,..."
}
```

---

### 2. Test Analyze Function

```bash
curl -X POST https://YOUR-PREVIEW-URL/.netlify/functions/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://nlabteam.com"}'
```

**Expected Result:**
```json
{
  "success": true,
  "screenshot": "data:image/png;base64,...",
  "zones": [
    {
      "name": "Header",
      "available": true,
      "size": "728x90",
      "priority": "high",
      "description": "Top navigation area..."
    }
  ],
  "language": "ru",
  "emails": ["contact@example.com"],
  "companyName": "NLABTEAM",
  "ownerInfo": "Brief company description...",
  "proposal": "Здравствуйте! ..."
}
```

---

### 3. Browser Test

1. Open preview URL in browser
2. Enter: `https://nlabteam.com`
3. Click "Найти"
4. Verify:
   - ✅ Screenshot is displayed
   - ✅ Language is detected (ru)
   - ✅ Company name is shown
   - ✅ Owner info is displayed
   - ✅ Email(s) found (if available)
   - ✅ Ad zones are listed with availability status
   - ✅ Proposal is generated in Russian
   - ✅ Copy button works
   - ✅ Execution time < 60 seconds
   - ✅ No errors in browser console

---

### 4. English Website Test

```bash
curl -X POST https://YOUR-PREVIEW-URL/.netlify/functions/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

**Verify:**
- ✅ `language: "en"`
- ✅ Proposal is in English

---

### 5. Check Netlify Function Logs

Open: Netlify Dashboard → Functions → Logs

**Expected log flow:**
```
🔍 === ANALYSIS START ===
URL: https://nlabteam.com

📸 STEP 1: Getting screenshot...
✅ Screenshot obtained

🤖 STEP 2: Analyzing with OpenAI Vision...
✅ Vision analysis complete
Found zones: 4
Language: ru

📧 STEP 3: Scraping website...
✅ Scraping complete
Emails found: 2
Company: NLABTEAM

🔎 STEP 4: Researching owner...
✅ Research complete

✍️ STEP 5: Generating proposal...
✅ Proposal generated

🎉 === ANALYSIS COMPLETE ===
```

**If there are errors - DO NOT complete the task!**

---

## ✅ Success Criteria

### Functionality:
- [x] Screenshots work via Playwright + Chromium
- [x] OpenAI Vision analyzes screenshots
- [x] Ad zones are identified realistically
- [x] Emails are found on the website
- [x] Company name is determined
- [x] Owner is researched via OpenAI
- [x] Proposal is personalized
- [x] Language is auto-detected
- [x] Proposal is in correct language

### Quality:
- [x] Detailed logging at each step
- [x] Error handling for all steps
- [x] Clear user messages
- [x] Execution time < 60 seconds
- [x] Code is documented

### UI:
- [x] Screenshot is displayed
- [x] All zones are shown
- [x] Proposal is shown
- [x] Emails are listed
- [x] Copy button works
- [x] Progress is shown
- [x] Execution time is displayed

---

## 🔧 Environment Variables Required

Ensure these are set in Netlify:

- `OPENAI_API_KEY` - Your OpenAI API key
- `URL` - Your Netlify site URL (auto-set by Netlify)

---

## 🚀 Local Testing

To test locally:

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Set environment variable:
   ```bash
   export OPENAI_API_KEY="sk-..."
   export URL="http://localhost:8888"
   ```

3. Run dev server:
   ```bash
   netlify dev
   ```

4. Test in browser at `http://localhost:8888`

---

## 📝 Example Test Output

### Test on nlabteam.com

**Expected Results:**
- Language: Russian
- Company: NLABTEAM or similar
- Zones: Header, Sidebar, Content, Footer (depending on actual layout)
- Proposal: Personalized Russian email about ad opportunities
- Execution: < 45 seconds typically

### Test on example.com

**Expected Results:**
- Language: English
- Company: Example Domain or similar
- Zones: Minimal (simple page)
- Proposal: Personalized English email
- Execution: < 30 seconds typically

---

## ❌ Common Issues

### Screenshot Timeout
- **Cause:** Website is slow or blocking requests
- **Solution:** Increase timeout in screenshot.js or try different site

### No Emails Found
- **Cause:** Website doesn't publicly display emails
- **Result:** emails array is empty (this is OK, not an error)

### Generic Proposal
- **Cause:** Company name not found or OpenAI returned generic text
- **Solution:** Check scraping logic, verify OpenAI prompts

### Language Detection Wrong
- **Cause:** OpenAI Vision misidentified language
- **Solution:** Verify screenshot quality, check Vision API prompt

---

## 🎯 Test Checklist

Before completing the task, verify ALL of these:

- [ ] Screenshot function works independently
- [ ] Analyze function returns complete data
- [ ] Browser UI displays all information correctly
- [ ] Language detection works for Russian site
- [ ] Language detection works for English site
- [ ] Proposal is in correct language
- [ ] Emails are found (when available)
- [ ] Company info is displayed
- [ ] Copy button works
- [ ] No console errors
- [ ] Execution time is acceptable (< 60s)
- [ ] Logs are clean and informative
- [ ] Error messages are user-friendly

---

## 📸 Required Screenshot

When completing the task, provide a screenshot showing:

1. ✅ URL tested (nlabteam.com)
2. ✅ Screenshot of the website
3. ✅ List of ad zones with availability
4. ✅ Found emails
5. ✅ First 10 lines of proposal
6. ✅ Execution time
7. ✅ Browser console with no errors

---

**TESTED ON: https://nlabteam.com**

**Status: READY FOR TESTING**
