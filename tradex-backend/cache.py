import time
from typing import Any, Optional
from functools import wraps
import hashlib
import json


class SimpleCache:
    def __init__(self, default_ttl: int = 30):
        self.cache = {}
        self.default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        if key in self.cache:
            entry = self.cache[key]
            if time.time() < entry["expires_at"]:
                return entry["value"]
            else:
                del self.cache[key]
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        self.cache[key] = {
            "value": value,
            "expires_at": time.time() + (ttl or self.default_ttl),
        }

    def delete(self, key: str):
        if key in self.cache:
            del self.cache[key]

    def clear(self):
        self.cache.clear()

    def cleanup(self):
        now = time.time()
        expired = [k for k, v in self.cache.items() if now >= v["expires_at"]]
        for k in expired:
            del self.cache[k]


cache = SimpleCache(default_ttl=30)


def make_cache_key(*args, **kwargs) -> str:
    key_parts = [str(arg) for arg in args]
    key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
    raw_key = ":".join(key_parts)
    return hashlib.md5(raw_key.encode()).hexdigest()


def cached(ttl: int = 30):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{make_cache_key(*args, **kwargs)}"
            
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            result = await func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator
