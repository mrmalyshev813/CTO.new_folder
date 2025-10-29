"""
Configuration management for AdLook CLI.

Handles loading and validating configuration from environment variables.
"""

import os
from typing import Optional
from dataclasses import dataclass


@dataclass
class Config:
    """Configuration for AdLook CLI."""
    
    openai_api_key: str
    timeout: int = 30
    viewport_width: int = 1920
    viewport_height: int = 1080
    max_retries: int = 3
    
    @classmethod
    def from_env(cls, require_api_key: bool = True) -> "Config":
        """
        Load configuration from environment variables.
        
        Args:
            require_api_key: If True, raises an error if OPENAI_API_KEY is not set
        
        Returns:
            Config instance with loaded values
            
        Raises:
            ValueError: If OPENAI_API_KEY is required but not set
        """
        api_key = os.getenv("OPENAI_API_KEY", "")
        
        if require_api_key and not api_key:
            raise ValueError(
                "OPENAI_API_KEY environment variable is required. "
                "Please set it before running the CLI:\n"
                "  export OPENAI_API_KEY='your-api-key-here'\n"
                "Or create a .env file with OPENAI_API_KEY=your-api-key-here"
            )
        
        return cls(
            openai_api_key=api_key,
            timeout=int(os.getenv("ADLOOK_TIMEOUT", "30")),
            viewport_width=int(os.getenv("ADLOOK_VIEWPORT_WIDTH", "1920")),
            viewport_height=int(os.getenv("ADLOOK_VIEWPORT_HEIGHT", "1080")),
            max_retries=int(os.getenv("ADLOOK_MAX_RETRIES", "3")),
        )
