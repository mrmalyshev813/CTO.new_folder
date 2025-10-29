"""File system utilities for AdLook CLI."""

import os
import json
from pathlib import Path
from datetime import datetime
from typing import Any, Dict
import tldextract


def ensure_output_dir(path: str) -> Path:
    """
    Ensure an output directory exists, creating it if necessary.
    
    Args:
        path: Directory path to create
        
    Returns:
        Path object for the directory
    """
    output_path = Path(path)
    output_path.mkdir(parents=True, exist_ok=True)
    return output_path


def create_timestamped_dir(base_dir: str, url: str) -> Path:
    """
    Create a timestamped output directory for a given URL.
    
    Creates a directory structure like:
    base_dir/domain.com/YYYY-MM-DD_HH-MM-SS/
    
    Args:
        base_dir: Base output directory
        url: URL being analyzed
        
    Returns:
        Path object for the created directory
    """
    extracted = tldextract.extract(url)
    domain = f"{extracted.domain}.{extracted.suffix}" if extracted.suffix else extracted.domain
    
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    
    output_dir = Path(base_dir) / domain / timestamp
    output_dir.mkdir(parents=True, exist_ok=True)
    
    return output_dir


def write_json_file(path: Path, data: Dict[str, Any]) -> None:
    """
    Write data to a JSON file.
    
    Args:
        path: Path to the output file
        data: Data to write as JSON
    """
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def write_text_file(path: Path, content: str) -> None:
    """
    Write text content to a file.
    
    Args:
        path: Path to the output file
        content: Text content to write
    """
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
