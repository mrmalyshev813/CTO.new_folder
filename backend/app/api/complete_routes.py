import logging
import uuid
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from ..services.complete_parser import analyze_website_complete

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/complete")


class AnalyzeRequest(BaseModel):
    url: HttpUrl


class AnalyzeResponse(BaseModel):
    success: bool
    screenshot: str = None
    zones: list = None
    language: str = None
    emails: list = None
    company_name: str = None
    title: str = None
    description: str = None
    owner_info: str = None
    proposal: str = None
    error: str = None
    analysis_id: str = None


# Cache for storing analysis results
analysis_cache: Dict[str, Dict[str, Any]] = {}


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_website_complete_endpoint(request: AnalyzeRequest):
    """
    Complete website analysis using the new parser workflow.
    
    This endpoint implements the full workflow:
    1. Screenshot capture with Playwright
    2. Vision analysis with OpenAI
    3. Email and company scraping
    4. Company owner research
    5. Personalized proposal generation
    6. Auto language detection
    """
    url = str(request.url)
    logger.info(f"Starting complete analysis for URL: {url}")
    
    try:
        # Run complete analysis
        result = await analyze_website_complete(url)
        
        if not result.get('success'):
            logger.error(f"Analysis failed: {result.get('error')}")
            return AnalyzeResponse(
                success=False,
                error=result.get('error', 'Unknown error'),
                analysis_id=None
            )
        
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Cache the result
        analysis_cache[analysis_id] = result
        
        # Prepare response
        response_data = {
            'success': True,
            'screenshot': result.get('screenshot'),
            'zones': result.get('zones', []),
            'language': result.get('language'),
            'emails': result.get('emails', []),
            'company_name': result.get('company_name'),
            'title': result.get('title'),
            'description': result.get('description'),
            'owner_info': result.get('owner_info'),
            'proposal': result.get('proposal'),
            'analysis_id': analysis_id
        }
        
        logger.info(f"Complete analysis successful for {url}, ID: {analysis_id}")
        
        return AnalyzeResponse(**response_data)
        
    except Exception as error:
        logger.error(f"Unexpected error in complete analysis: {error}")
        return AnalyzeResponse(
            success=False,
            error=f"Internal server error: {str(error)}",
            analysis_id=None
        )


@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    """
    Retrieve a previously completed analysis by ID.
    """
    if analysis_id not in analysis_cache:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    result = analysis_cache[analysis_id]
    
    return {
        'success': True,
        'data': result
    }


@router.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """
    Delete a cached analysis.
    """
    if analysis_id not in analysis_cache:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    del analysis_cache[analysis_id]
    
    return {
        'success': True,
        'message': 'Analysis deleted successfully'
    }


@router.get("/health")
async def health_check():
    """
    Health check endpoint for the complete parser.
    """
    return {
        'status': 'healthy',
        'service': 'complete_parser',
        'version': '1.0.0'
    }