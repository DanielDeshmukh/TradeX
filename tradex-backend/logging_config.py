import logging
import sys
from datetime import datetime
import json


class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if hasattr(record, "extra_data"):
            log_entry["extra"] = record.extra_data
        return json.dumps(log_entry)


def setup_logging(log_level: str = "INFO"):
    logger = logging.getLogger("tradex")
    logger.setLevel(getattr(logging, log_level.upper()))
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    
    if not logger.handlers:
        logger.addHandler(handler)
    
    return logger


logger = setup_logging()


def log_request(method: str, path: str, status_code: int, duration_ms: float):
    logger.info(f"{method} {path} {status_code} {duration_ms:.2f}ms")


def log_error(error: str, path: str = None, extra: dict = None):
    extra_data = {"error": error}
    if path:
        extra_data["path"] = path
    if extra:
        extra_data.update(extra)
    
    record = logging.LogRecord(
        name="tradex",
        level=logging.ERROR,
        pathname="",
        lineno=0,
        msg=error,
        args=(),
        exc_info=None,
    )
    record.extra_data = extra_data
    logger.handle(record)


def log_performance(operation: str, duration_ms: float, details: dict = None):
    extra_data = {"operation": operation, "duration_ms": duration_ms}
    if details:
        extra_data.update(details)
    
    record = logging.LogRecord(
        name="tradex",
        level=logging.INFO,
        pathname="",
        lineno=0,
        msg=f"Performance: {operation}",
        args=(),
        exc_info=None,
    )
    record.extra_data = extra_data
    logger.handle(record)
