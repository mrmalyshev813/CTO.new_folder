"""Command-line interface argument parsing for AdLook CLI."""

import argparse
import sys
from pathlib import Path
from typing import Optional

from . import __version__


def create_parser() -> argparse.ArgumentParser:
    """
    Create and configure the argument parser for AdLook CLI.
    
    Returns:
        Configured ArgumentParser instance
    """
    parser = argparse.ArgumentParser(
        prog="adlook_cli",
        description="Analyze websites for ad placement opportunities using AI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m adlook_cli https://example.com
  python -m adlook_cli https://example.com --output ./results --verbose
  python -m adlook_cli https://example.com --dry-run

Environment Variables:
  OPENAI_API_KEY       OpenAI API key (required for analysis)
  ADLOOK_TIMEOUT       Request timeout in seconds (default: 30)
  ADLOOK_VIEWPORT_WIDTH   Viewport width for browser (default: 1920)
  ADLOOK_VIEWPORT_HEIGHT  Viewport height for browser (default: 1080)
  ADLOOK_MAX_RETRIES   Maximum retry attempts (default: 3)

Note:
  After installing dependencies, run: python -m playwright install chromium
        """
    )
    
    parser.add_argument(
        "url",
        type=str,
        help="Target URL to analyze for ad placement opportunities"
    )
    
    parser.add_argument(
        "-o", "--output",
        type=str,
        default="./output",
        help="Output directory for analysis results (default: ./output)"
    )
    
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose logging (DEBUG level)"
    )
    
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate configuration and arguments without running analysis"
    )
    
    parser.add_argument(
        "--version",
        action="version",
        version=f"%(prog)s {__version__}"
    )
    
    return parser


def parse_args(args: Optional[list] = None) -> argparse.Namespace:
    """
    Parse command-line arguments.
    
    Args:
        args: List of arguments to parse (defaults to sys.argv[1:])
        
    Returns:
        Parsed arguments namespace
    """
    parser = create_parser()
    return parser.parse_args(args)
