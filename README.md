# Ad Placement Analyzer

A web service that analyzes websites for ad placement opportunities using OpenAI Vision (GPT-4o). This tool helps identify optimal locations for advertisements by analyzing website screenshots, finding contact information, researching companies, and generating personalized proposals.

## 🚀 Latest: Complete Ad Parser

**NEW!** Full-featured ad parser with:
- ✅ Screenshot capture via Playwright + Chromium
- ✅ Visual analysis using OpenAI Vision (GPT-4o)
- ✅ Email and contact extraction
- ✅ Company research and background info
- ✅ Personalized proposal generation
- ✅ Automatic language detection (Russian/English)

📚 **See [README_COMPLETE_PARSER.md](./README_COMPLETE_PARSER.md) for complete documentation**

🧪 **See [TESTING_COMPLETE_PARSER.md](./TESTING_COMPLETE_PARSER.md) for testing guide**

## Features

- Screenshot capture using Puppeteer + Chromium
- Visual AI analysis using OpenAI Vision (GPT-4o)
- Email and contact extraction via web scraping
- Company research using AI
- Personalized proposal generation in detected language
- Serverless architecture with Netlify Functions
- Modern web-based frontend interface

## Prerequisites

- Node.js 14.x or higher
- OpenAI API key
- Netlify account (for deployment)

## Local Development Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run locally with Netlify CLI

```bash
npm run dev
```

The application will be available at `http://localhost:8888`

## Deployment to Netlify

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Connect to GitHub**
   - Log in to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repository

2. **Configure build settings**
   - Build command: `npm install` (or leave empty)
   - Publish directory: `.`
   - Functions directory: `netlify/functions`

3. **Set environment variables**
   - Go to Site settings → Environment variables
   - Add `OPENAI_API_KEY` with your OpenAI API key

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically deploy your site

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod
```

When prompted:
- Publish directory: `.`
- Functions directory: `netlify/functions`

**Important:** After deployment, set the environment variable in Netlify dashboard:
- Go to Site settings → Environment variables
- Add `OPENAI_API_KEY` with your OpenAI API key
- Redeploy the site for changes to take effect

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for GPT-4o-mini access | Yes |

Configure this in:
- **Local development**: `.env` file in the root directory
- **Netlify deployment**: Site settings → Environment variables in Netlify dashboard

## Project Structure

```
.
├── netlify/
│   └── functions/
│       ├── analyze.js       # Main analysis function
│       ├── export-docx.js   # DOCX export function
│       └── export-pdf.js    # PDF export function
├── backend/                 # Legacy Python backend (for reference)
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── api/
│       └── services/
├── frontend/                # Legacy frontend (for reference)
│   └── index.html
├── index.html              # Main web interface
├── netlify.toml            # Netlify configuration
├── package.json            # Node.js dependencies
├── .env.example            # Environment variables template
└── README.md
```

## Architecture

The application uses a serverless architecture optimized for Netlify:

- **Frontend**: Static HTML served from the root directory
- **Backend**: Three Netlify Functions (serverless)
  - `analyze.js` - Website crawling, AI analysis, and proposal generation
  - `export-docx.js` - DOCX file export
  - `export-pdf.js` - PDF file export

### Technology Stack

- **Web Scraping**: Puppeteer Core v21.5.2 with @sparticuz/chromium v119.0.2 (Netlify-compatible)
- **AI Analysis**: OpenAI Node.js SDK (GPT-4o-mini)
- **HTML Parsing**: Cheerio
- **DOCX Generation**: docx npm package
- **PDF Generation**: PDFKit
- **Hosting**: Netlify Functions + Static hosting

## API Endpoints

When deployed on Netlify, the functions are available at:

- `POST /.netlify/functions/analyze` - Analyze a website for ad placement opportunities
  - Request body: `{"url": "https://example.com"}`
  - Returns: Analysis results with detected zones and proposal text
- `GET /.netlify/functions/export-docx/{analysis_id}` - Download proposal as DOCX file
- `GET /.netlify/functions/export-pdf/{analysis_id}` - Download proposal as PDF file

### Example Usage

```bash
# Analyze a website
curl -X POST https://your-site.netlify.app/.netlify/functions/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://news.ycombinator.com"}'

# Download DOCX (use analysis_id from response)
curl -o proposal.docx \
  "https://your-site.netlify.app/.netlify/functions/export-docx/{analysis_id}"

# Download PDF
curl -o proposal.pdf \
  "https://your-site.netlify.app/.netlify/functions/export-pdf/{analysis_id}"
```

## Testing

### Local Testing

```bash
# Start local development server
npm run dev

# Open browser to http://localhost:8888
# Test with URL: https://nlabteam.com
```

### Automated Testing

```bash
# Run basic function tests
npm run test

# Run comprehensive E2E tests with real websites
npm run test:e2e
```

### Code Quality Checks

This project uses pre-commit and pre-push hooks to ensure code quality:

```bash
# Run all validation checks manually
npm run precommit

# Individual checks
npm run validate:js     # Validate JavaScript syntax
npm run validate:html   # Validate HTML structure
npm run lint:check      # Run ESLint
npm run lint            # Run ESLint with auto-fix
```

See [PRE_COMMIT_CHECKS.md](PRE_COMMIT_CHECKS.md) for detailed documentation.

### Test Checklist

- ✅ Website crawling with Puppeteer Core + @sparticuz/chromium
- ✅ AI analysis with GPT-4o-mini
- ✅ Proposal generation (Adlook template, no asterisks)
- ✅ DOCX export functionality
- ✅ PDF export functionality
- ✅ Error handling for invalid URLs
- ✅ All functions working on Netlify
- ✅ Tested with real websites (nlabteam.com, example.com, news.ycombinator.com)

## Troubleshooting

### Local Development Issues

**Issue**: Functions not working locally
```bash
# Make sure Netlify CLI is installed
npm install -g netlify-cli

# Use netlify dev instead of a regular web server
netlify dev
```

**Issue**: OpenAI API errors
```bash
# Verify your API key is set correctly
echo $OPENAI_API_KEY

# Make sure .env file exists with correct key
cat .env
```

### Netlify Deployment Issues

**Issue**: Functions failing on Netlify

1. Check environment variables are set in Netlify dashboard
2. Check function logs in Netlify dashboard: Site → Functions → View logs
3. Ensure `OPENAI_API_KEY` is set correctly

**Issue**: Timeout errors

- Netlify Functions have a 10-second timeout on free tier (26 seconds on Pro)
- Consider upgrading to Pro if analyzing large websites

**Issue**: Memory errors

- Netlify Functions have 1024MB memory limit
- Puppeteer Core with @sparticuz/chromium is optimized for Netlify
- If issues persist, consider analyzing smaller HTML snippets

### Chrome/Puppeteer Issues

**Issue**: Browser launch fails on Netlify

The project uses `@sparticuz/chromium` which is specifically designed for serverless environments like Netlify Functions, AWS Lambda, etc. This is the modern replacement for the deprecated `chrome-aws-lambda`.

If you encounter issues:
1. Verify `@sparticuz/chromium` version is v119.0.2 or compatible
2. Ensure `puppeteer-core` version matches (v21.5.2 or compatible)
3. Check that `netlify.toml` includes the correct bundler configuration:
   ```toml
   [functions]
     node_bundler = "esbuild"
     external_node_modules = ["@sparticuz/chromium"]
     included_files = ["node_modules/@sparticuz/chromium/**"]
   ```

## Migration from Python FastAPI

This project was originally built with Python FastAPI and has been migrated to Netlify Functions (Node.js) for serverless deployment. The legacy Python code is kept in the `backend/` and `frontend/` directories for reference.

Key changes:
- Python → Node.js/JavaScript
- FastAPI → Netlify Functions
- Playwright → Puppeteer Core with @sparticuz/chromium
- WeasyPrint → PDFKit
- python-docx → docx npm package

## Auto-merge for cto.new PRs

This repository is configured with automatic merging for Pull Requests created by the cto.new bot. This ensures that approved changes from the bot are merged automatically without manual intervention.

### How it works

1. **Automatic Trigger**: When a PR is opened, reopened, or synchronized by the cto.new bot, the auto-merge workflow is triggered
2. **Safety Checks**: The workflow verifies:
   - PR is from verified cto.new bot account (`cto-ai-app[bot]` or `cto-new[bot]`)
   - PR does not have the `no-auto-merge` label
   - No merge conflicts exist
   - All required status checks pass (if any are configured)
3. **Auto-approval**: The workflow automatically approves the PR
4. **Merge**: The PR is merged using the standard merge strategy (not squash or rebase)
5. **Notification**: A comment is added to the PR confirming the auto-merge

### Manual Override

To prevent a cto.new PR from being automatically merged:

1. Add the `no-auto-merge` label to the PR
2. The workflow will detect this label and skip the auto-merge process
3. You can then review and merge manually

### Security

- Only PRs from verified cto.new bot accounts are eligible for auto-merge
- All configured branch protection rules and status checks must pass
- Merge conflicts prevent auto-merge
- The workflow logs all actions for audit purposes

### Workflow File

The auto-merge workflow is defined in `.github/workflows/auto-merge.yml` and includes:

- Author verification
- Label-based manual override
- Merge conflict detection
- Status check validation
- Automatic PR approval
- Standard merge execution
- Post-merge notifications

## Documentation

- **[README.md](README.md)** - This file, setup and deployment instructions
- **[PRE_COMMIT_CHECKS.md](PRE_COMMIT_CHECKS.md)** - Guide for pre-commit hooks and code quality checks
- **[CHANGELOG_BUGFIX.md](CHANGELOG_BUGFIX.md)** - Recent bugfixes and improvements
- **[QUICK_START.md](QUICK_START.md)** - Quick setup guide
- **[TEST_RESULTS.md](TEST_RESULTS.md)** - Comprehensive test report
- **[NETLIFY_PUPPETEER_FIX.md](NETLIFY_PUPPETEER_FIX.md)** - Puppeteer fix details and test results
- **[PUPPETEER_FIX_SUMMARY.md](PUPPETEER_FIX_SUMMARY.md)** - Task completion summary
- **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** - Complete verification checklist
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical documentation

## License

TBD
