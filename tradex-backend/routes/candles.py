from fastapi import APIRouter, Query
from database import fetch_all

router = APIRouter(tags=["candles"])


@router.get("/candles")
async def get_candles(
    symbol: str = Query(..., description="Symbol name (e.g., RELIANCE)"),
    timeframe: str = Query("1min", description="Candle timeframe (1min, 5min, 15min, 1hour)"),
    limit: int = Query(100, ge=1, le=1000, description="Number of candles"),
):
    query = """
        SELECT timestamp, open, high, low, close, volume
        FROM candles
        WHERE security_id = %s AND timeframe = %s
        ORDER BY timestamp DESC
        LIMIT %s
    """
    rows = fetch_all(query, (symbol, timeframe, limit))
    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "candles": [dict(r) for r in reversed(rows)],
    }
