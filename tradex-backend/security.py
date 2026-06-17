from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import time
from collections import defaultdict
import re
from typing import Optional


class RateLimiter:
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    def is_rate_limited(self, client_id: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds
        
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > window_start
        ]
        
        if len(self.requests[client_id]) >= self.max_requests:
            return True
        
        self.requests[client_id].append(now)
        return False

    def get_remaining(self, client_id: str) -> int:
        now = time.time()
        window_start = now - self.window_seconds
        
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > window_start
        ]
        
        return max(0, self.max_requests - len(self.requests[client_id]))


rate_limiter = RateLimiter(max_requests=100, window_seconds=60)


class InputSanitizer:
    @staticmethod
    def sanitize_string(value: str, max_length: int = 255) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        value = re.sub(r'[<>"\';\\]', '', value)
        return value[:max_length] if value else None

    @staticmethod
    def validate_email(email: str) -> bool:
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    @staticmethod
    def validate_user_id(user_id: str) -> bool:
        return bool(re.match(r'^[a-zA-Z0-9_-]{1,255}$', user_id))

    @staticmethod
    def validate_symbol_id(symbol_id: str) -> bool:
        return bool(re.match(r'^[A-Z0-9]{1,50}$', symbol_id))


sanitizer = InputSanitizer()


async def rate_limit_middleware(request: Request, call_next):
    client_id = request.client.host if request.client else "unknown"
    
    if rate_limiter.is_rate_limited(client_id):
        return JSONResponse(
            status_code=429,
            content={
                "error": True,
                "message": "Rate limit exceeded. Please try again later.",
                "retry_after": 60,
            }
        )
    
    response = await call_next(request)
    response.headers["X-RateLimit-Remaining"] = str(rate_limiter.get_remaining(client_id))
    return response


def validate_sql_input(value: str) -> str:
    dangerous_patterns = [
        r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)',
        r'(--|;|/\*|\*/)',
        r"(OR\s+1\s*=\s*1|AND\s+1\s*=\s*1)",
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, value, re.IGNORECASE):
            raise HTTPException(status_code=400, detail="Invalid input detected")
    
    return value
