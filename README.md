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

## License

TBD
