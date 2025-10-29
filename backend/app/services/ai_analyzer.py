import logging
import json
from typing import List, Dict, Optional, Tuple
from openai import OpenAI
from ..config import settings

logger = logging.getLogger(__name__)


def analyze_website_with_ai(url: str, html_content: str) -> Tuple[List[Dict[str, str]], bool, Optional[str]]:
    """
    Analyze website structure using OpenAI GPT-4o-mini to identify ad placement zones.
    
    Args:
        url: The website URL
        html_content: The HTML content of the website
        
    Returns:
        Tuple of (zones_list, success, error_message)
        zones_list format: [{"zone": "Header", "priority": "high"}, ...]
    """
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        html_snippet = html_content[:5000] if len(html_content) > 5000 else html_content
        
        prompt = f"""You are an expert in web advertising and ad placement optimization.

Analyze the following website: {url}

HTML structure (snippet):
{html_snippet}

Identify the optimal ad placement zones on this website. For each zone, assign a priority level.

Available zones:
- Header: Top of the page, navigation area
- Sidebar: Left or right sidebar areas
- Content: Within the main content area
- Footer: Bottom of the page
- Popup: Overlay or modal opportunities

For each zone you identify as present and suitable for ads, assign one of these priorities:
- high: Highly visible, high engagement potential
- medium: Moderate visibility and engagement
- low: Present but less optimal

Return ONLY a JSON array with this exact format:
[
  {{"zone": "Header", "priority": "high"}},
  {{"zone": "Sidebar", "priority": "medium"}},
  ...
]

Important: Only include zones that actually exist on the website. Do not include all zones by default.
Return ONLY the JSON array, no additional text or explanation."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert web advertising analyst. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        
        content = response.choices[0].message.content.strip()
        
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        zones = json.loads(content)
        
        if not isinstance(zones, list):
            raise ValueError("AI response is not a list")
        
        for zone in zones:
            if not isinstance(zone, dict) or "zone" not in zone or "priority" not in zone:
                raise ValueError("Invalid zone format in AI response")
        
        logger.info(f"Successfully analyzed website with AI: {url}, found {len(zones)} zones")
        return zones, True, None
        
    except json.JSONDecodeError as e:
        error_msg = f"Failed to parse AI response as JSON: {str(e)}"
        logger.error(error_msg)
        return [], False, error_msg
        
    except Exception as e:
        error_msg = f"Error analyzing website with AI: {str(e)}"
        logger.error(error_msg)
        return [], False, error_msg
