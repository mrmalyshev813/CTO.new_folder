import logging
import json
from typing import List, Dict, Optional, Tuple
from openai import OpenAI
from ..config import settings

logger = logging.getLogger(__name__)


def analyze_website_with_ai(url: str, html_content: str) -> Tuple[Dict[str, any], bool, Optional[str]]:
    """
    Analyze website structure using OpenAI GPT-4o-mini to identify ad placement zones.
    
    Args:
        url: The website URL
        html_content: The HTML content of the website
        
    Returns:
        Tuple of (analysis_dict, success, error_message)
        analysis_dict format: {
            "siteType": "news portal",
            "trafficEstimate": "high",
            "zones": [{"zone": "Header", "priority": "high", "occupancy": "free", "reason": "..."}]
        }
    """
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        html_snippet = html_content[:8000] if len(html_content) > 8000 else html_content
        
        prompt = f"""You are an expert in web advertising and ad placement optimization.

Analyze the following website: {url}

HTML structure (snippet):
{html_snippet}

Perform a comprehensive analysis and provide the following information:

1. SITE TYPE: Determine the category of the website (e.g., news portal, e-commerce, blog, corporate site, forum, entertainment, educational, etc.)

2. TRAFFIC ESTIMATE: Based on the site's structure, content volume, and complexity, provide a rough traffic estimate category:
   - low: Small site, likely under 1000 visitors/day
   - medium: Medium-sized site, 1000-10000 visitors/day
   - high: Large site with rich content, 10000-100000 visitors/day
   - very_high: Major site, likely over 100000 visitors/day

3. AD OCCUPANCY: Analyze if the site already has advertising placements. Look for:
   - Ad networks (Google AdSense, Yandex.Direct, etc.)
   - Banner placeholders or ad slots
   - Affiliate links
   - Sponsored content markers
   For each zone, indicate if it's "occupied" (already has ads) or "free" (available for ads)

4. AD PLACEMENT ZONES: Identify optimal ad placement zones on this website. For each zone:
   - Name the zone (Header, Sidebar, Content, Footer, Popup)
   - Assign priority (high, medium, low)
   - Indicate occupancy status (occupied or free)
   - Provide a brief reason why this zone is good for ads

Return ONLY a JSON object with this exact format:
{{
  "siteType": "news portal",
  "trafficEstimate": "high",
  "zones": [
    {{
      "zone": "Header",
      "priority": "high",
      "occupancy": "free",
      "reason": "Prime visibility, first thing users see"
    }},
    {{
      "zone": "Sidebar",
      "priority": "medium",
      "occupancy": "occupied",
      "reason": "Good visibility but already has Google AdSense"
    }}
  ]
}}

Important: Only include zones that actually exist on the website. Provide realistic analysis based on the HTML content.
Return ONLY the JSON object, no additional text or explanation."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert web advertising analyst. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        content = response.choices[0].message.content.strip()
        
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        analysis = json.loads(content)
        
        if not isinstance(analysis, dict) or "zones" not in analysis:
            raise ValueError("AI response does not contain valid zones")
        
        if not isinstance(analysis["zones"], list):
            raise ValueError("AI response zones is not a list")
        
        for zone in analysis["zones"]:
            if not isinstance(zone, dict) or "zone" not in zone or "priority" not in zone or "occupancy" not in zone:
                raise ValueError("Invalid zone format in AI response")
        
        result = {
            "siteType": analysis.get("siteType", "unknown"),
            "trafficEstimate": analysis.get("trafficEstimate", "medium"),
            "zones": analysis["zones"]
        }
        
        logger.info(f"Successfully analyzed website with AI: {url}, found {len(result['zones'])} zones")
        return result, True, None
        
    except json.JSONDecodeError as e:
        error_msg = f"Failed to parse AI response as JSON: {str(e)}"
        logger.error(error_msg)
        return {"siteType": "unknown", "trafficEstimate": "medium", "zones": []}, False, error_msg
        
    except Exception as e:
        error_msg = f"Error analyzing website with AI: {str(e)}"
        logger.error(error_msg)
        return {"siteType": "unknown", "trafficEstimate": "medium", "zones": []}, False, error_msg
