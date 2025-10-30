import logging
import json
import base64
import re
from typing import Dict, List, Optional, Tuple
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from openai import OpenAI
from ..config import settings

logger = logging.getLogger(__name__)


class CompleteWebsiteParser:
    """
    Complete parser workflow that implements all steps from the ticket:
    1. Screenshot with Playwright
    2. Vision analysis with OpenAI
    3. Email scraping
    4. Company owner research
    5. Personalized proposal generation
    6. Auto language detection
    """
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
    
    async def capture_screenshot(self, url: str) -> Tuple[Optional[str], bool, Optional[str]]:
        """
        Capture website screenshot using Playwright.
        
        Returns:
            Tuple of (base64_screenshot, success, error_message)
        """
        logger.info(f'📸 Capturing screenshot for: {url}')
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    args=['--no-sandbox', '--disable-setuid-sandbox']
                )
                
                page = await browser.new_page(
                    viewport={'width': 1920, 'height': 1080}
                )
                
                # Navigate with timeout
                await page.goto(url, {
                    'wait_until': 'networkidle',
                    'timeout': 30000
                })
                
                # Take screenshot
                screenshot = await page.screenshot(
                    full_page=True,
                    type='png'
                )
                
                logger.info('✅ Screenshot captured')
                
                # Convert to base64 for OpenAI
                base64_screenshot = base64.b64encode(screenshot).decode('utf-8')
                screenshot_data_url = f'data:image/png;base64,{base64_screenshot}'
                
                await browser.close()
                
                return screenshot_data_url, True, None
                
        except Exception as error:
            logger.error(f'❌ Screenshot error: {error}')
            return None, False, f'Не удалось создать скриншот: {str(error)}'
    
    async def analyze_screenshot_for_ads(self, url: str, screenshot_data_url: str) -> Tuple[Optional[Dict], bool, Optional[str]]:
        """
        Analyze screenshot using OpenAI Vision API to identify ad placement opportunities.
        
        Returns:
            Tuple of (analysis_result, success, error_message)
        """
        logger.info('🤖 Analyzing screenshot with OpenAI Vision...')
        
        if not self.openai_client:
            return None, False, 'OpenAI API key is not configured'
        
        try:
            # Remove data URL prefix for API call
            base64_image = screenshot_data_url.split(',')[1]
            
            response = self.openai_client.chat.completions.create(
                model='gpt-4o',  # Supports vision
                messages=[{
                    'role': 'user',
                    'content': [
                        {
                            'type': 'text',
                            'text': f'''Проанализируй скриншот сайта {url} и определи рекламные возможности.

Визуально оцени где можно разместить рекламу:
1. Header (шапка сайта, навигация)
2. Sidebar (боковая панель справа или слева)  
3. Content (внутри контента, между блоками)
4. Footer (подвал сайта)
5. Popup (модальные окна)

Для каждой зоны укажи:
- name: название зоны
- available: true если место свободно, false если уже занято рекламой
- size: рекомендуемый размер баннера (например "728x90", "300x250")
- priority: "high" для самых заметных мест, "medium" для менее заметных
- description: подробное описание где именно находится зона и почему она подходит

ВАЖНО: Реально оценивай - есть ли свободное место или всё уже занято.

Верни JSON:
{{
  "zones": [
    {{
      "name": "Header",
      "available": true,
      "size": "728x90",
      "priority": "high",
      "description": "..."
    }}
  ],
  "language": "ru" or "en" (определи язык сайта)
}}'''
                        },
                        {
                            'type': 'image_url',
                            'image_url': {
                                'url': screenshot_data_url,
                                'detail': 'high'
                            }
                        }
                    ]
                }],
                response_format={'type': 'json_object'},
                max_tokens=2000
            )
            
            result = json.loads(response.choices[0].message.content)
            logger.info('✅ Vision analysis complete')
            return result, True, None
            
        except Exception as error:
            logger.error(f'❌ Vision analysis error: {error}')
            return None, False, f'OpenAI Vision API error: {str(error)}'
    
    async def scrape_website_data(self, url: str) -> Dict:
        """
        Scrape website for emails and company information.
        
        Returns:
            Dict with emails, company_name, title, description
        """
        logger.info('🔍 Scraping website data...')
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    args=['--no-sandbox', '--disable-setuid-sandbox']
                )
                
                page = await browser.new_page()
                await page.goto(url, {
                    'wait_until': 'networkidle',
                    'timeout': 30000
                })
                
                html_content = await page.content()
                await browser.close()
                
                soup = BeautifulSoup(html_content, 'html.parser')
                
                # Extract emails
                emails = []
                email_regex = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
                
                # Search in text content
                text = soup.get_text()
                found_emails = re.findall(email_regex, text)
                emails.extend(found_emails)
                
                # Search in mailto links
                for link in soup.find_all('a', href=lambda x: x and x.startswith('mailto:')):
                    email = link['href'].replace('mailto:', '')
                    emails.append(email)
                
                # Extract company name
                company_name = None
                
                # Try meta tags
                company_name = (
                    soup.find('meta', property='og:site_name') or
                    soup.find('meta', attrs={'name': 'author'})
                )
                if company_name:
                    company_name = company_name.get('content')
                else:
                    # Try title
                    title_tag = soup.find('title')
                    if title_tag:
                        company_name = title_tag.get_text().split('|')[0].strip()
                
                # Try footer for Russian company formats
                if not company_name:
                    footer_text = soup.find('footer')
                    if footer_text:
                        footer_content = footer_text.get_text()
                        match = re.search(r'(ООО|ИП|АО|ЗАО|ПАО)\s+["«]?([^"»\n]+)["»]?', footer_content)
                        if match:
                            company_name = match.group(0)
                
                # Clean and deduplicate emails
                unique_emails = list(set(email.strip() for email in emails if email and '@' in email))
                
                result = {
                    'emails': unique_emails,
                    'company_name': company_name,
                    'title': soup.find('title').get_text() if soup.find('title') else None,
                    'description': soup.find('meta', attrs={'name': 'description'}).get('content') if soup.find('meta', attrs={'name': 'description'}) else None
                }
                
                logger.info(f'✅ Found {len(unique_emails)} emails, company: {company_name}')
                return result
                
        except Exception as error:
            logger.error(f'❌ Scraping error: {error}')
            return {'emails': [], 'company_name': None, 'title': None, 'description': None}
    
    async def research_company_owner(self, company_name: str, website_url: str) -> Dict:
        """
        Research company information using OpenAI.
        
        Returns:
            Dict with insights about the company
        """
        logger.info('🔎 Researching company owner...')
        
        if not company_name:
            return {'insights': 'Информация о компании не найдена'}
        
        if not self.openai_client:
            return {'insights': 'OpenAI API key is not configured'}
        
        try:
            prompt = f'''Найди информацию о компании "{company_name}" (сайт: {website_url}).

Используя общедоступную информацию, найди:
1. Полное название компании и юридическая форма (ООО, ИП и т.д.)
2. Имя руководителя/директора (если доступно)
3. Основная деятельность компании
4. Интересные факты или достижения

Если информации нет - честно напиши что не найдено.

Верни короткий отчёт (3-5 предложений) на русском языке.'''
            
            response = self.openai_client.chat.completions.create(
                model='gpt-4o-mini',
                messages=[{'role': 'user', 'content': prompt}],
                max_tokens=500
            )
            
            insights = response.choices[0].message.content
            logger.info('✅ Research complete')
            return {'insights': insights}
            
        except Exception as error:
            logger.error(f'❌ Research error: {error}')
            return {'insights': f'Ошибка при поиске информации: {str(error)}'}
    
    async def generate_personalized_proposal(self, data: Dict) -> str:
        """
        Generate personalized commercial proposal.
        
        Args:
            data: Dict containing website_url, zones, language, company_name, owner_info, emails
            
        Returns:
            Generated proposal text
        """
        logger.info('✍️ Generating personalized proposal...')
        
        if not self.openai_client:
            return 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.'
        
        try:
            website_url = data['website_url']
            zones = data['zones']
            language = data['language']
            company_name = data.get('company_name')
            owner_info = data.get('owner_info', {})
            emails = data.get('emails', [])
            
            # Determine template language
            is_english = language == 'en'
            
            available_zones = [z for z in zones if z.get('available')]
            zones_description = '\n'.join([
                f"{i+1}. {zone['name']} — {zone['description']}"
                for i, zone in enumerate(available_zones)
            ])
            
            if is_english:
                prompt = f'''Generate a personalized commercial proposal in ENGLISH for advertising placement.
                
Website: {website_url}
Company: {company_name or 'Website owner'}
Owner info: {owner_info.get('insights', 'Not available')}
Available ad zones: 
{zones_description}

Write a professional email following this structure:
1. Greeting (personalized if owner name available)
2. Compliment about their website/content
3. Brief about Adlook company
4. List of advertising opportunities
5. Call to action

Be professional and persuasive. Full email in English.'''
            else:
                prompt = f'''Сгенерируй персонализированное коммерческое предложение на РУССКОМ языке.

Сайт: {website_url}
Компания: {company_name or 'Владелец сайта'}
Информация о владельце: {owner_info.get('insights', 'Не найдена')}
Доступные рекламные места:
{zones_description}

Напиши профессиональное письмо по структуре:
1. Приветствие (персонализированное если есть имя)
2. Комплимент про их сайт/контент (конкретный, основанный на информации)
3. Кратко про компанию Adlook
4. Список рекламных возможностей
5. Призыв к действию

Используй шаблон из примера Adlook. Без звёздочек (*). Профессиональный тон.'''
            
            response = self.openai_client.chat.completions.create(
                model='gpt-4o-mini',
                messages=[{'role': 'user', 'content': prompt}],
                max_tokens=1500,
                temperature=0.7
            )
            
            proposal = response.choices[0].message.content
            logger.info('✅ Proposal generated')
            return proposal
            
        except Exception as error:
            logger.error(f'❌ Proposal generation error: {error}')
            return f'Ошибка при генерации предложения: {str(error)}'
    
    async def analyze_website_complete(self, url: str) -> Dict:
        """
        Complete workflow that orchestrates all analysis steps.
        
        Returns:
            Dict with all analysis results
        """
        logger.info('\n🚀 === STARTING COMPLETE ANALYSIS ===\n')
        
        try:
            # Step 1: Capture screenshot
            logger.info('STEP 1: Screenshot')
            screenshot_data_url, screenshot_success, screenshot_error = await self.capture_screenshot(url)
            
            if not screenshot_success:
                return {
                    'success': False,
                    'error': f'Failed to capture screenshot: {screenshot_error}'
                }
            
            # Step 2: Vision analysis
            logger.info('\nSTEP 2: Vision Analysis')
            vision_result, vision_success, vision_error = await self.analyze_screenshot_for_ads(url, screenshot_data_url)
            
            if not vision_success:
                return {
                    'success': False,
                    'error': f'Failed to analyze screenshot: {vision_error}'
                }
            
            # Step 3: Scrape website data
            logger.info('\nSTEP 3: Scraping')
            scraped_data = await self.scrape_website_data(url)
            
            # Step 4: Research company
            logger.info('\nSTEP 4: Research')
            owner_info = await self.research_company_owner(scraped_data.get('company_name'), url)
            
            # Step 5: Generate proposal
            logger.info('\nSTEP 5: Generate Proposal')
            proposal = await self.generate_personalized_proposal({
                'website_url': url,
                'zones': vision_result.get('zones', []),
                'language': vision_result.get('language', 'en'),
                'company_name': scraped_data.get('company_name'),
                'owner_info': owner_info,
                'emails': scraped_data.get('emails', [])
            })
            
            logger.info('\n✅ === ANALYSIS COMPLETE ===\n')
            
            return {
                'success': True,
                'screenshot': screenshot_data_url,
                'zones': vision_result.get('zones', []),
                'language': vision_result.get('language', 'en'),
                'emails': scraped_data.get('emails', []),
                'company_name': scraped_data.get('company_name'),
                'title': scraped_data.get('title'),
                'description': scraped_data.get('description'),
                'owner_info': owner_info.get('insights'),
                'proposal': proposal
            }
            
        except Exception as error:
            logger.error(f'\n❌ === ANALYSIS FAILED ===')
            logger.error(f'Error: {error}')
            return {
                'success': False,
                'error': str(error)
            }


# Global parser instance
parser = CompleteWebsiteParser()


async def analyze_website_complete(url: str) -> Dict:
    """
    Convenience function to analyze a website completely.
    
    Args:
        url: Website URL to analyze
        
    Returns:
        Dict with complete analysis results
    """
    return await parser.analyze_website_complete(url)