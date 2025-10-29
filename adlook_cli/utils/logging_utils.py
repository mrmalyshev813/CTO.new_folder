"""Logging utilities for AdLook CLI."""

import logging
import sys
from typing import Optional


def setup_logging(verbose: bool = False) -> None:
    """
    Configure logging for the CLI.
    
    Args:
        verbose: If True, sets logging level to DEBUG, otherwise INFO
    """
    level = logging.DEBUG if verbose else logging.INFO
    
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        stream=sys.stdout,
    )


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a given name.
    
    Args:
        name: Name for the logger (typically __name__)
        
    Returns:
        Logger instance
    """
    return logging.getLogger(name)
