PYTHON ?= python3
PIP ?= $(PYTHON) -m pip
VENV ?= .venv
PLAYWRIGHT_BROWSERS ?= chromium

.PHONY: help install install-dev run playwrighinstall playwright-install

help:
	@echo "Available targets:"
	@echo "  make install           Install project dependencies"
	@echo "  make install-dev       Install project dependencies with dev extras"
	@echo "  make playwright-install  Install Playwright browsers"
	@echo "  make run               Run the development server"

install:
	$(PIP) install --upgrade pip
	$(PIP) install .

install-dev:
	$(PIP) install --upgrade pip
	$(PIP) install .[dev]

playwright-install:
	$(PYTHON) -m playwright install $(PLAYWRIGHT_BROWSERS)

run:
	uvicorn app.main:app --reload
