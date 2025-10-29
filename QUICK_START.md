# Quick Start Guide - Ad Placement Analyzer

This guide will help you get the Ad Placement Analyzer up and running in under 5 minutes.

## Prerequisites

- Python 3.8 or higher
- OpenAI API key (get one at https://platform.openai.com/api-keys)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ad-placement-analyzer
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Install Playwright Browsers
```bash
playwright install chromium
playwright install-deps chromium  # May require sudo on Linux
```

### 5. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-proj-...
```

### 6. Start the Server
```bash
uvicorn backend.app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using StatReload
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 7. Open in Browser
Navigate to: **http://localhost:8000**

## Using the Application

### Web Interface

1. **Enter a URL**: Type any website URL (e.g., https://news.ycombinator.com)
2. **Click Analyze**: Wait 5-15 seconds for analysis to complete
3. **Review Results**: See detected ad zones with priorities
4. **Read Proposal**: View the generated commercial proposal
5. **Download**: Click "Download DOCX" or "Download PDF" to export

### API Usage

#### Analyze a Website
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://news.ycombinator.com"}'
```

Response:
```json
{
  "proposal_text": "Subject: Предложение по рекламе...",
  "zones": [
    {"zone": "Header", "priority": "high"},
    {"zone": "Content", "priority": "medium"}
  ],
  "analysis_id": "uuid-string"
}
```

#### Download DOCX
```bash
curl -o proposal.docx \
  "http://localhost:8000/api/export/docx/{analysis_id}"
```

#### Download PDF
```bash
curl -o proposal.pdf \
  "http://localhost:8000/api/export/pdf/{analysis_id}"
```

## Test Websites

Try analyzing these websites:
- https://news.ycombinator.com
- https://techcrunch.com
- https://reddit.com
- https://stackoverflow.com
- https://github.com

## Troubleshooting

### "Module not found" errors
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Playwright browser issues
```bash
# Install browsers again
playwright install chromium

# Install system dependencies (Linux)
playwright install-deps chromium
```

### OpenAI API errors
- Check that your API key is correct in `.env`
- Verify you have credits in your OpenAI account
- Check your internet connection

### WeasyPrint PDF errors (Linux)
```bash
# Install required system library
sudo apt-get install -y libpangoft2-1.0-0
```

## What's Next?

- Read [TEST_RESULTS.md](TEST_RESULTS.md) for comprehensive test report
- Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details
- Visit http://localhost:8000/docs for interactive API documentation

## Common Commands

```bash
# Start server (development)
uvicorn backend.app.main:app --reload

# Start server (production)
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000

# Check server health
curl http://localhost:8000/health

# View server logs (if running in background)
tail -f server.log

# Stop server
# Press Ctrl+C (if running in foreground)
# Or: pkill -f uvicorn
```

## Support

For detailed documentation, see:
- **README.md** - Complete setup and usage guide
- **TEST_RESULTS.md** - Test results and validation
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details

## Tips

1. **Analysis Time**: Larger websites take longer to analyze (5-15 seconds)
2. **API Costs**: Each analysis uses OpenAI API credits (~$0.001-0.01 per request)
3. **Caching**: Results are cached temporarily for export
4. **File Cleanup**: Exported files are stored in `/tmp/adlook_exports`
5. **CORS**: The API allows all origins for development (configure for production)

---

**Happy Analyzing! 🚀**
