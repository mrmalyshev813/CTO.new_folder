# AdLook CLI

Command-line interface for analyzing websites for ad placement opportunities using AI.

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install Playwright browsers:
```bash
python -m playwright install chromium
```

## Configuration

Set the required environment variable:

```bash
export OPENAI_API_KEY='your-api-key-here'
```

Or create a `.env` file in the project root:

```
OPENAI_API_KEY=your-api-key-here
```

### Optional Configuration

Additional environment variables can be set to customize behavior:

- `ADLOOK_TIMEOUT` - Request timeout in seconds (default: 30)
- `ADLOOK_VIEWPORT_WIDTH` - Browser viewport width (default: 1920)
- `ADLOOK_VIEWPORT_HEIGHT` - Browser viewport height (default: 1080)
- `ADLOOK_MAX_RETRIES` - Maximum retry attempts (default: 3)

## Usage

### Basic Usage

Analyze a website:

```bash
python -m adlook_cli https://example.com
```

### Options

- `-o, --output DIR` - Specify output directory (default: ./output)
- `-v, --verbose` - Enable verbose logging (DEBUG level)
- `--dry-run` - Validate configuration without running analysis
- `--version` - Show version information
- `-h, --help` - Show help message

### Examples

Analyze with custom output directory:
```bash
python -m adlook_cli https://example.com --output ./results
```

Verbose logging:
```bash
python -m adlook_cli https://example.com --verbose
```

Dry run (validate without analyzing):
```bash
python -m adlook_cli https://example.com --dry-run
```

## Output Structure

Analysis results are saved in a timestamped directory structure:

```
output/
└── domain.com/
    └── YYYY-MM-DD_HH-MM-SS/
        └── (analysis files)
```

Example: `output/example.com/2025-10-29_14-30-45/`

## Architecture

### Package Structure

```
adlook_cli/
├── __init__.py          # Package initialization
├── __main__.py          # Main entrypoint
├── cli.py               # Argument parsing
├── config.py            # Configuration management
└── utils/
    ├── __init__.py      # Utilities export
    ├── logging_utils.py # Logging setup
    ├── file_utils.py    # File I/O helpers
    └── stats_utils.py   # Runtime statistics
```

### Components

- **CLI Parser**: Uses argparse for command-line argument handling
- **Configuration**: Validates environment variables and provides clear error messages
- **Utilities**: Reusable helpers for logging, file operations, and statistics tracking

## Development

The CLI is designed to be extended with actual analysis functionality. Current implementation:

1. ✅ Argument parsing
2. ✅ Configuration validation
3. ✅ Output directory management
4. ✅ Logging infrastructure
5. ✅ Runtime statistics tracking
6. ⏳ Analysis implementation (pending)

## Error Handling

The CLI provides clear error messages for common issues:

- Missing `OPENAI_API_KEY`: Provides instructions on how to set it
- Invalid URLs: Will validate URL format
- Missing dependencies: Shows which packages need to be installed

## Exit Codes

- `0` - Success
- `1` - Configuration or runtime error
- `130` - Interrupted by user (Ctrl+C)
