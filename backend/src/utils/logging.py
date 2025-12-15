import logging
import sys
from typing import Optional
from ..config.settings import settings


def setup_logging():
    """
    Set up logging configuration for the application
    """
    log_level = logging.DEBUG if settings.debug else logging.INFO

    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(console_handler)

    # Set specific loggers to WARNING to reduce noise
    logging.getLogger('uvicorn').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('qdrant_client').setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a configured logger instance
    """
    logger = logging.getLogger(name)
    return logger


# Global logger instance
logger = get_logger(__name__)