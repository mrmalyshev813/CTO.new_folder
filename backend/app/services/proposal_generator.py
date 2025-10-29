import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


def generate_proposal(url: str, zones: List[Dict[str, str]]) -> str:
    """
    Generate a commercial proposal text based on the analyzed zones.
    
    Args:
        url: The website URL
        zones: List of ad zones with priorities
        
    Returns:
        Formatted proposal text
    """
    proposal_lines = [
        f"Subject: Предложение по рекламе на сайте {url}",
        "",
        "Здравствуйте!",
        "",
        f"Прежде всего хочу поздравить вас с успешным развитием вашего ресурса. {url} привлекает широкую аудиторию. Мы в Adlook уверены, что грамотное размещение рекламы позволит значительно увеличить доход.",
        "",
        "Немного о нас: Adlook — это российская SSP-платформа (Supply-Side Platform), основанная в 2018 году в Санкт-Петербурге. Мы помогаем владельцам сайтов монетизировать свои ресурсы.",
        "",
        "Мы проанализировали ваш сайт и выделили несколько эффективных зон:"
    ]
    
    priority_zones = [z for z in zones if z.get("priority") in ["high", "medium", "low"]]
    
    if priority_zones:
        for idx, zone in enumerate(priority_zones, 1):
            zone_name = zone.get("zone", "Unknown")
            priority = zone.get("priority", "unknown")
            proposal_lines.append(f"{idx}. {zone_name} – {priority} level")
    else:
        proposal_lines.append("Не удалось определить конкретные зоны.")
    
    proposal_lines.extend([
        "",
        "Потенциальный доход: от 50,000 до 150,000 рублей в месяц.",
        "",
        "Что мы предлагаем:",
        "- Сроки размещения: от одного месяца",
        "- Форматы: баннеры, контекстная реклама, всплывающие окна",
        "- Программная настройка рекламы под ваш сайт",
        "",
        "С уважением,",
        "Менеджер по работе с партнёрами, Adlook"
    ])
    
    proposal_text = "\n".join(proposal_lines)
    
    logger.info(f"Generated proposal for {url} with {len(priority_zones)} zones")
    
    return proposal_text
