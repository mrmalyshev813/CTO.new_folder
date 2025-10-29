import logging
import uuid
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, HttpUrl
from ..services.crawler import crawl_website
from ..services.ai_analyzer import analyze_website_with_ai
from ..services.proposal_generator import generate_proposal
from ..services.exporter import create_docx, create_pdf, get_file_path

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

analysis_cache: Dict[str, Dict[str, Any]] = {}


class AnalyzeRequest(BaseModel):
    url: HttpUrl


class AnalyzeResponse(BaseModel):
    proposal_text: str
    zones: list
    analysis_id: str


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_website(request: AnalyzeRequest):
    """
    Analyze a website for ad placement opportunities.
    """
    url = str(request.url)
    logger.info(f"Starting analysis for URL: {url}")
    
    screenshot_bytes, html_content, success, error = await crawl_website(url)
    
    if not success:
        logger.error(f"Failed to crawl website: {error}")
        raise HTTPException(status_code=400, detail=f"Failed to crawl website: {error}")
    
    analysis_result, ai_success, ai_error = analyze_website_with_ai(url, html_content)
    
    if not ai_success:
        logger.error(f"Failed to analyze with AI: {ai_error}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze website: {ai_error}")
    
    proposal_text = generate_proposal(
        url, 
        analysis_result["siteType"], 
        analysis_result["trafficEstimate"], 
        analysis_result["zones"]
    )
    
    analysis_id = str(uuid.uuid4())
    
    analysis_cache[analysis_id] = {
        "url": url,
        "site_type": analysis_result["siteType"],
        "traffic_estimate": analysis_result["trafficEstimate"],
        "zones": analysis_result["zones"],
        "proposal_text": proposal_text,
        "screenshot_bytes": screenshot_bytes
    }
    
    docx_path, docx_success, docx_error = create_docx(proposal_text, analysis_id)
    if not docx_success:
        logger.warning(f"Failed to create DOCX: {docx_error}")
    
    pdf_path, pdf_success, pdf_error = create_pdf(proposal_text, analysis_id)
    if not pdf_success:
        logger.warning(f"Failed to create PDF: {pdf_error}")
    
    logger.info(f"Analysis completed successfully for {url}, ID: {analysis_id}")
    
    return AnalyzeResponse(
        proposal_text=proposal_text,
        zones=analysis_result["zones"],
        analysis_id=analysis_id
    )


@router.get("/export/docx/{analysis_id}")
async def export_docx(analysis_id: str):
    """
    Download the proposal as a DOCX file.
    """
    file_path = get_file_path(analysis_id, "docx")
    
    if not file_path:
        raise HTTPException(status_code=404, detail="DOCX file not found")
    
    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"proposal_{analysis_id}.docx"
    )


@router.get("/export/pdf/{analysis_id}")
async def export_pdf(analysis_id: str):
    """
    Download the proposal as a PDF file.
    """
    file_path = get_file_path(analysis_id, "pdf")
    
    if not file_path:
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"proposal_{analysis_id}.pdf"
    )
