# User Guide: Setting Up Your OpenAI API Key

## Quick Start

To use the NLABTEAM Smart Parser, you need to configure your OpenAI API key. Follow these simple steps:

### Step 1: Get Your API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account (or create one if you don't have it)
3. Click "Create new secret key"
4. Give your key a name (e.g., "Smart Parser")
5. Copy the key (it starts with `sk-`)
   - **Important**: Save this key somewhere safe! You won't be able to see it again.

### Step 2: Configure in the Application

1. Open the Smart Parser application
2. You'll see a welcome message asking you to configure your API key
3. Click the **"🔑 Настроить API ключ"** button (or the button in the bottom-right corner)
4. A settings window will open
5. Paste your API key into the input field
6. Click **"Сохранить"** (Save)

### Step 3: Start Using

1. The button will change to **"✅ API Подключен"** (green) when connected
2. Enter a website URL in the search field
3. Click **"Найти"** to analyze the website
4. That's it! 🎉

## Frequently Asked Questions

### Where is my API key stored?

Your API key is stored securely in your browser's localStorage. It never leaves your browser except when making API calls to OpenAI.

### Is my API key safe?

- Your key is stored only on your device (in browser localStorage)
- The application doesn't send your key to any server except OpenAI
- The input field is masked (password type) so others can't see it
- **Recommendation**: Always use HTTPS and never share your API key with others

### How much does it cost?

The application uses OpenAI's API, which is a paid service. Costs depend on your usage:
- GPT-4o for vision analysis: ~$5-10 per 1M tokens
- GPT-4o-mini for text generation: ~$0.15-0.60 per 1M tokens

Each website analysis uses approximately:
- 1,000-2,000 tokens for vision analysis
- 500-1,500 tokens for text generation
- **Estimated cost**: $0.01-0.05 per website analysis

You can monitor your usage and set spending limits in your [OpenAI account](https://platform.openai.com/usage).

### Can I change my API key later?

Yes! Just click the API key button (bottom-right corner) and enter a new key.

### What if I lose my API key?

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Revoke the old key (for security)
3. Create a new key
4. Update it in the application

### Do I need to configure the key every time?

No! Your API key is saved in your browser and persists across sessions. You only need to configure it once per browser/device.

### The application says my key is invalid

Make sure your API key:
- Starts with `sk-`
- Was copied completely (no spaces or missing characters)
- Hasn't been revoked in your OpenAI account
- Has sufficient credits in your OpenAI account

## Troubleshooting

### Error: "API ключ не настроен"

**Solution**: You haven't configured your API key yet. Click the "Настроить API ключ" button and follow Step 2 above.

### Error: "The OPENAI_API_KEY is missing"

**Solution**: Same as above - configure your API key in the settings.

### Error: "401 Unauthorized" or "Invalid API key"

**Possible causes**:
1. Your API key is incorrect
2. Your API key was revoked
3. Your OpenAI account has insufficient credits

**Solution**: 
1. Check your key in [OpenAI Platform](https://platform.openai.com/api-keys)
2. Verify your account has credits
3. Create a new key if needed

### Error: "429 Too Many Requests"

**Cause**: You've exceeded your rate limit or quota.

**Solution**: 
1. Wait a few minutes and try again
2. Check your [usage limits](https://platform.openai.com/account/limits)
3. Upgrade your OpenAI plan if needed

### The button still shows "🔌 Подключить API OpenAI" after saving

**Solution**: 
1. Make sure your key starts with `sk-`
2. Refresh the page
3. Open the settings and check if the key is there

## Privacy & Security

### What data is sent to OpenAI?

When you analyze a website, the following data is sent to OpenAI:
- Screenshot of the website
- Website URL
- Website text content (for email/company extraction)

### What data is stored locally?

Only your API key is stored in browser localStorage. No analysis results or website data is saved locally.

### Can others access my API key?

Your API key is stored in your browser's localStorage, which is:
- Specific to your browser and device
- Not accessible to other websites
- Not accessible to other users on the same device (if using separate browser profiles)

However, if someone has physical access to your device and browser, they could potentially access it. Always:
- Lock your device when not in use
- Use private/incognito mode on shared devices
- Don't share your API key

## Support

If you encounter any issues:

1. Check this guide first
2. Verify your API key is valid on [OpenAI Platform](https://platform.openai.com/api-keys)
3. Check the browser console for error messages (F12 → Console tab)
4. Contact support with the error details

---

**Last updated**: 2024
**Version**: 1.0
