# Netlify Quick Start Guide

Get your Ad Placement Analyzer running on Netlify in under 10 minutes!

## Step 1: Install Dependencies (Local Development)

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
echo "OPENAI_API_KEY=your_actual_api_key_here" > .env
```

Replace `your_actual_api_key_here` with your OpenAI API key.

## Step 3: Test Locally

```bash
npm run dev
```

Open http://localhost:8888 in your browser.

Test with a URL like `https://nlabteam.com`.

## Step 4: Deploy to Netlify

### Option A: GitHub + Netlify Dashboard (Recommended)

1. Push your code to GitHub
2. Go to https://app.netlify.com/
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your GitHub repository
5. Configure:
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
6. Click **"Deploy site"**
7. After deployment, add environment variable:
   - Go to **Site settings** → **Environment variables**
   - Add `OPENAI_API_KEY` with your API key
8. Redeploy the site

### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

When prompted:
- Publish directory: `.`

After deployment, set environment variable in Netlify dashboard.

## Step 5: Test Your Deployment

Visit your Netlify URL (e.g., `https://your-site.netlify.app`).

Test with `https://nlabteam.com`.

Verify all features work:
- ✅ Website analysis
- ✅ Proposal generation
- ✅ DOCX export
- ✅ PDF export

## Troubleshooting

**Functions not working?**
- Check that `OPENAI_API_KEY` is set in Netlify dashboard
- Redeploy after setting environment variables

**Timeout errors?**
- Netlify free tier has 10-second timeout
- Consider upgrading to Pro for 26-second timeout

**Need help?**
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
- View function logs in Netlify dashboard

## Success!

Your Ad Placement Analyzer is now live on Netlify! 🎉

Share your URL and start analyzing websites for ad placement opportunities.
