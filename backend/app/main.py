from __future__ import annotations

import logging
from importlib import metadata

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
logging.basicConfig(level=settings.log_level.upper(), format=LOG_FORMAT)
logger = logging.getLogger(__name__)

try:
    backend_version = metadata.version("backend")
except metadata.PackageNotFoundError:  # pragma: no cover - fallback during local development
    backend_version = "0.1.0"

app = FastAPI(
    title=settings.app_name,
    version=backend_version,
    debug=settings.debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])  # pragma: no cover - simple health endpoint
async def health_check() -> dict[str, str]:
    """Return a simple status payload for uptime checks."""
    logger.debug("Health check endpoint called")
    return {"status": "ok"}
