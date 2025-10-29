# Project Monorepo

This repository contains a monorepo setup with separate `backend/` and `frontend/` workspaces. The backend is a FastAPI application providing APIs and automation services, while the frontend will host the user interface that interacts with those APIs.

## Repository Structure

```
.
├── backend/        # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── main.py
│   ├── Makefile
│   └── pyproject.toml
├── frontend/       # Placeholder for the future frontend implementation
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+ (for the future frontend workspace)
- [Playwright system dependencies](https://playwright.dev/python/docs/intro#system-requirements)
- `git`, `make`, and a POSIX-compatible shell

### Environment Variables

The backend uses [pydantic-settings](https://docs.pydantic.dev/latest/usage/pydantic_settings/) to load environment variables from the local environment or an optional `.env` file in `backend/`. Create `backend/.env` (do not commit it) containing at minimum:

```
OPENAI_API_KEY=your-openai-api-key
APP_NAME=Backend API (optional override)
DEBUG=false (optional)
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"] (optional JSON array)
LOG_LEVEL=INFO (optional)
```

## Backend Setup

1. **Create a virtual environment**

   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install dependencies**

   ```bash
   make install  # use `make install-dev` for development extras
   ```

3. **Install Playwright browsers**

   ```bash
   make playwright-install
   ```

4. **Run the development server**

   ```bash
   make run
   # server will start on http://127.0.0.1:8000
   ```

5. **Verify the health endpoint**

   Navigate to <http://127.0.0.1:8000/health> to confirm the service is running.

## Frontend Setup (Placeholder)

The `frontend/` directory is reserved for the upcoming frontend application. A typical setup will involve:

```bash
cd frontend
npm install
npm run dev
```

Detailed instructions will be added once the frontend stack is defined.

## Development Environment

- Configure your IDE to use the `backend/.venv` virtual environment for linting and formatting.
- Playwright stores artifacts under `backend/playwright/`. These paths are included in the project `.gitignore`.
- If you are using VS Code, consider leveraging the Python and Playwright extensions for an improved development experience.
