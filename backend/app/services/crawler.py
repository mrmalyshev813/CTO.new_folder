import logging
from io import BytesIO
from typing import Tuple, Optional
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


async def crawl_website(url: str) -> Tuple[Optional[bytes], Optional[str], bool, Optional[str]]:
    """
    Crawl a website using Playwright and extract content.
    
    Args:
        url: The URL to crawl
        
    Returns:
        Tuple of (screenshot_bytes, html_content, success, error_message)
    """
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                await page.goto(url, wait_until="networkidle", timeout=30000)
                
                screenshot_bytes = await page.screenshot(full_page=True, type="png")
                html_content = await page.content()
                
                await browser.close()
                
                soup = BeautifulSoup(html_content, 'html.parser')
                cleaned_html = soup.prettify()
                
                logger.info(f"Successfully crawled website: {url}")
                return screenshot_bytes, cleaned_html, True, None
                
            except PlaywrightTimeoutError:
                await browser.close()
                error_msg = f"Timeout while loading {url}"
                logger.error(error_msg)
                return None, None, False, error_msg
                
            except Exception as e:
                await browser.close()
                error_msg = f"Error crawling {url}: {str(e)}"
                logger.error(error_msg)
                return None, None, False, error_msg
                
    except Exception as e:
        error_msg = f"Failed to initialize browser: {str(e)}"
        logger.error(error_msg)
        return None, None, False, error_msg
