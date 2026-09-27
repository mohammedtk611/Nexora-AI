import logging
import sys
from app.core.config import settings

def setup_logging():
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Suppress verbose loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("pdfminer").setLevel(logging.WARNING)

logger = logging.getLogger("revamp_ai")
