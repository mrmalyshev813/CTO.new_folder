# Ad Placement Analyzer

A web service that analyzes websites for ad placement opportunities using GPT-4o-mini. This tool helps identify optimal locations for advertisements by analyzing website structure, content, and user engagement patterns.

## Features

- Web scraping and analysis using Playwright
- AI-powered recommendations using OpenAI GPT-4o-mini
- FastAPI backend with REST API
- Simple web-based frontend interface
- Report generation in multiple formats (DOCX, PDF)

## Prerequisites

- Python 3.8 or higher
- OpenAI API key

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Playwright browsers**
   ```bash
   playwright install
   ```

5. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Running the Application

1. **Start the backend server**
   ```bash
   uvicorn backend.app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`
   - API documentation: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/health`

2. **Open the frontend**
   
   Open `frontend/index.html` in your web browser, or serve it using a simple HTTP server:
   ```bash
   cd frontend
   python -m http.server 8080
   ```
   Then navigate to `http://localhost:8080`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for GPT-4o-mini access | Yes |

## Project Structure

```
.
├── backend/
│   └── app/
│       ├── __init__.py
│       ├── main.py          # FastAPI application
│       └── config.py        # Configuration settings
├── frontend/
│   └── index.html           # Web interface
├── requirements.txt         # Python dependencies
├── .gitignore
└── README.md
```

## Development

The backend is built with FastAPI and includes:
- CORS middleware for frontend communication
- Logging configuration
- Health check endpoint
- Pydantic settings for configuration management

## API Endpoints

- `GET /health` - Health check endpoint

(More endpoints will be added as development progresses)

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

## License

TBD
