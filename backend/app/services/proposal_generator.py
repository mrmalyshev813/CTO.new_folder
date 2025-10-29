import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


def generate_proposal(url: str, site_type: str, traffic_estimate: str, zones: List[Dict[str, str]]) -> str:
    """
    Generate a personalized commercial proposal text based on the analyzed zones.
    
    Args:
        url: The website URL
        site_type: Type of the website (e.g., news portal, blog, e-commerce)
        traffic_estimate: Traffic estimate (low, medium, high, very_high)
        zones: List of ad zones with priorities and occupancy status
        
    Returns:
        Formatted proposal text
    """
    proposal_lines = [
        f"Subject: Увеличьте доход от {url} с Adlook - индивидуальное предложение",
        "",
        "Здравствуйте!",
        ""
    ]
    
    site_type_descriptions = {
        'news portal': 'новостного портала',
        'news': 'новостного портала',
        'e-commerce': 'интернет-магазина',
        'blog': 'блога',
        'corporate site': 'корпоративного сайта',
        'corporate': 'корпоративного сайта',
        'forum': 'форума',
        'entertainment': 'развлекательного ресурса',
        'educational': 'образовательного портала',
        'magazine': 'онлайн-журнала',
        'media': 'медиа-ресурса'
    }
    
    site_type_ru = site_type_descriptions.get(site_type.lower(), 'веб-ресурса')
    
    traffic_descriptions = {
        'low': 'стабильной аудиторией',
        'medium': 'активной аудиторией',
        'high': 'внушительным трафиком',
        'very_high': 'огромной аудиторией'
    }
    
    traffic_desc = traffic_descriptions.get(traffic_estimate, 'растущей аудиторией')
    
    proposal_lines.append(
        f"Я изучил ваш проект {url} и был впечатлен! Вижу, что у вас качественный {site_type_ru} с {traffic_desc}. Это отличная база для масштабирования монетизации."
    )
    proposal_lines.append("")
    
    free_zones = [z for z in zones if z.get("occupancy") == "free"]
    occupied_zones = [z for z in zones if z.get("occupancy") == "occupied"]
    
    if occupied_zones:
        proposal_lines.append(
            "Я заметил, что у вас уже есть реклама на сайте. Это хорошо - значит, вы уже монетизируете трафик. Однако мы можем помочь увеличить доход на 30-50% за счёт оптимизации существующих мест и использования свободных зон."
        )
        proposal_lines.append("")
    
    proposal_lines.append(
        "Немного о нас: Adlook — это российская SSP-платформа (Supply-Side Platform), основанная в 2018 году в Санкт-Петербурге. Мы помогаем владельцам сайтов монетизировать свои ресурсы через прямую интеграцию с крупнейшими рекламодателями."
    )
    proposal_lines.append("")
    
    proposal_lines.append("Результаты анализа вашего сайта:")
    proposal_lines.append("")
    
    if free_zones:
        proposal_lines.append("ДОСТУПНЫЕ ЗОНЫ ДЛЯ РАЗМЕЩЕНИЯ (свободны):")
        for idx, zone in enumerate(free_zones, 1):
            priority = zone.get("priority", "unknown")
            priority_ru = {
                'high': 'высокий приоритет',
                'medium': 'средний приоритет',
                'low': 'низкий приоритет'
            }.get(priority, priority)
            
            proposal_lines.append(f"{idx}. {zone.get('zone', 'Unknown')} ({priority_ru})")
            if zone.get("reason"):
                proposal_lines.append(f"   {zone['reason']}")
        proposal_lines.append("")
    
    if occupied_zones:
        proposal_lines.append("ЗАНЯТЫЕ ЗОНЫ (требуют оптимизации):")
        for idx, zone in enumerate(occupied_zones, 1):
            priority = zone.get("priority", "unknown")
            priority_ru = {
                'high': 'высокий приоритет',
                'medium': 'средний приоритет',
                'low': 'низкий приоритет'
            }.get(priority, priority)
            
            proposal_lines.append(f"{idx}. {zone.get('zone', 'Unknown')} ({priority_ru})")
            if zone.get("reason"):
                proposal_lines.append(f"   {zone['reason']}")
        proposal_lines.append("")
    
    revenue_estimates = {
        'low': {'min': 20000, 'max': 60000},
        'medium': {'min': 50000, 'max': 150000},
        'high': {'min': 150000, 'max': 500000},
        'very_high': {'min': 500000, 'max': 2000000}
    }
    
    revenue = revenue_estimates.get(traffic_estimate, revenue_estimates['medium'])
    
    proposal_lines.append("ВАШИ ВЫГОДЫ ОТ СОТРУДНИЧЕСТВА С ADLOOK:")
    proposal_lines.append("")
    proposal_lines.append(f"1. УВЕЛИЧЕНИЕ ДОХОДА: от {revenue['min']:,} до {revenue['max']:,} рублей в месяц".replace(',', ' '))
    
    if occupied_zones:
        proposal_lines.append("   Даже при наличии текущей рекламы, мы увеличим доход на 30-50% благодаря:")
        proposal_lines.append("   - Прямым контрактам с премиум-рекламодателями")
        proposal_lines.append("   - Более высоким ставкам за показы и клики")
        proposal_lines.append("   - Оптимизации существующих размещений")
    else:
        proposal_lines.append("   Вы получите стабильный пассивный доход без изменения контента сайта")
    
    proposal_lines.append("")
    proposal_lines.append("2. БЫСТРЫЙ СТАРТ: интеграция за 1 день")
    proposal_lines.append("   - Мы сами установим рекламный код")
    proposal_lines.append("   - Настроим оптимальные форматы под ваш дизайн")
    proposal_lines.append("   - Первые выплаты уже через 2 недели")
    proposal_lines.append("")
    proposal_lines.append("3. СОХРАНЕНИЕ ПОЛЬЗОВАТЕЛЬСКОГО ОПЫТА:")
    proposal_lines.append("   - Реклама не будет раздражать посетителей")
    proposal_lines.append("   - Адаптивные форматы под мобильные устройства")
    proposal_lines.append("   - Контроль над тематикой рекламы")
    proposal_lines.append("")
    proposal_lines.append("4. ПРОЗРАЧНОСТЬ И КОНТРОЛЬ:")
    proposal_lines.append("   - Личный кабинет с детальной статистикой в реальном времени")
    proposal_lines.append("   - Еженедельные отчёты о доходах")
    proposal_lines.append("   - Выплаты два раза в месяц, без задержек")
    proposal_lines.append("")
    
    site_type_lower = site_type.lower()
    if 'news' in site_type_lower or 'media' in site_type_lower:
        proposal_lines.append("5. СПЕЦИАЛЬНЫЕ УСЛОВИЯ ДЛЯ НОВОСТНЫХ РЕСУРСОВ:")
        proposal_lines.append("   - Премиум-рекламодатели, готовые платить больше за новостную аудиторию")
        proposal_lines.append("   - Нативные форматы, органично вписывающиеся в контент")
    elif 'commerce' in site_type_lower:
        proposal_lines.append("5. СПЕЦИАЛЬНЫЕ УСЛОВИЯ ДЛЯ E-COMMERCE:")
        proposal_lines.append("   - Товарные рекомендации с высокой конверсией")
        proposal_lines.append("   - Динамические баннеры на основе поведения пользователей")
    elif 'blog' in site_type_lower:
        proposal_lines.append("5. СПЕЦИАЛЬНЫЕ УСЛОВИЯ ДЛЯ БЛОГОВ:")
        proposal_lines.append("   - Нативная реклама в стиле ваших статей")
        proposal_lines.append("   - Брендированный контент от надёжных рекламодателей")
    
    proposal_lines.append("")
    proposal_lines.append("ФОРМАТЫ РАЗМЕЩЕНИЯ:")
    proposal_lines.append("- Баннеры (статичные и анимированные)")
    proposal_lines.append("- Нативная реклама (встраивается в контент)")
    proposal_lines.append("- Видео-реклама (для сайтов с высоким трафиком)")
    proposal_lines.append("- Rich-media форматы (интерактивные объявления)")
    proposal_lines.append("")
    proposal_lines.append("Готов обсудить детали и ответить на ваши вопросы. Могу подготовить индивидуальный расчёт дохода с учётом специфики вашего проекта.")
    proposal_lines.append("")
    proposal_lines.append("Давайте созвонимся на этой неделе? Предложите удобное время.")
    proposal_lines.append("")
    proposal_lines.append("С уважением,")
    proposal_lines.append("Менеджер по развитию партнёрств")
    proposal_lines.append("Adlook")
    proposal_lines.append("")
    proposal_lines.append("P.S. Отвечу на письмо в течение 2 часов. Также можете позвонить или написать в Telegram для более быстрой связи.")
    
    proposal_text = "\n".join(proposal_lines)
    
    logger.info(f"Generated personalized proposal for {url} (type: {site_type}, traffic: {traffic_estimate}) with {len(zones)} zones")
    
    return proposal_text
