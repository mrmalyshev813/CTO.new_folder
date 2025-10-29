# OpenAI API Key Configuration

## Quick Setup (Required)

To use the search functionality, you need to configure your OpenAI API key:

### Step 1: Create `.env.local`

Create a file named `.env.local` in the project root:

```bash
# In the project root directory
touch .env.local
```

### Step 2: Add Your API Key

Open `.env.local` and add:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

### Step 3: Restart Server

```bash
npm run dev
```

## Where to Get Your API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and add it to `.env.local`

## Why Environment Variables?

The original ticket requested a hardcoded API key, but GitHub's push protection blocked this for security reasons. Using environment variables is:

- ✅ More secure (key not in repository)
- ✅ Industry standard practice
- ✅ Required by GitHub security policies
- ✅ Easier to manage across environments

## Verification

After setup, test the API:

```bash
npm run dev
# Visit http://localhost:3000
# Try searching: "What is AI?"
```

If configured correctly, you'll see AI-generated responses.

## For the Provided API Key

If you have the API key from the ticket, add it to your `.env.local` file in the format:

```env
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
```

## Production Deployment

When deploying, add `OPENAI_API_KEY` as an environment variable in your hosting platform:

- **Vercel**: Settings → Environment Variables
- **Netlify**: Site settings → Build & deploy → Environment
- **Other platforms**: Follow their environment variable configuration guide

---

**Note**: The `.env.local` file is already in `.gitignore` and will not be committed to the repository.
