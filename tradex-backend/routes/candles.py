from fastapi import APIRouter, Query
from database import fetch_all

router = APIRouter(tags=["candles"])


@router.get("/candles")
async def get_candles(
    symbol: str = Query(..., description="Symbol name (e.g., RELIANCE)"),
    interval: str = Query("5m", description="Candle interval (1m, 5m, 15m, 1h)"),
    limit: int = Query(100, ge=1, le=1000, description="Number of candles"),
):
    query = """
        SELECT time, open, high, low, close, volume
        FROM candles
        WHERE symbol = %s AND interval = %s
        ORDER BY time DESC
        LIMIT %s
    """
    rows = fetch_all(query, (symbol, interval, limit))
    return {
        "symbol": symbol,
        "interval": interval,
        "candles": [dict(r) for r in reversed(rows)],
    }
