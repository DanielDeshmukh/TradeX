from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from functools import wraps
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class APIError(Exception):
    def __init__(self, message: str, status_code: int = 400, detail: any = None):
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(self.message)


def error_response(message: str, status_code: int = 400, detail: any = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "error": True,
            "message": message,
            "detail": detail,
            "status_code": status_code,
        }
    )


def success_response(data: any = None, message: str = "Success") -> JSONResponse:
    response = {"error": False, "message": message}
    if data is not None:
        response["data"] = data
    return JSONResponse(content=response)


async def api_error_handler(request: Request, exc: APIError) -> JSONResponse:
    logger.error(f"API Error: {exc.message} | Path: {request.url.path}")
    return error_response(exc.message, exc.status_code, exc.detail)


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled Exception: {str(exc)} | Path: {request.url.path}")
    return error_response(
        "Internal server error",
        status_code=500,
        detail=str(exc) if logger.isEnabledFor(logging.DEBUG) else None
    )


def handle_db_error(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Database error in {func.__name__}: {str(e)}")
            raise APIError(f"Database operation failed: {str(e)}", status_code=500)
    return wrapper


def validate_user_id(user_id: str) -> str:
    if not user_id or len(user_id.strip()) == 0:
        raise APIError("User ID is required", status_code=400)
    if len(user_id) > 255:
        raise APIError("User ID too long", status_code=400)
    return user_id.strip()
