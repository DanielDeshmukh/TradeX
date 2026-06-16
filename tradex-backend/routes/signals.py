from fastapi import APIRouter, Query
from database import fetch_all, fetch_one

router = APIRouter(tags=["signals"])


@router.get("/signals")
async def get_signals(
    symbol: str = Query(..., description="Symbol name"),
    limit: int = Query(50, ge=1, le=200, description="Number of signals"),
):
    query = """
        SELECT time, signal, confidence, model_version
        FROM trading_signals
        WHERE symbol = %s
        ORDER BY time DESC
        LIMIT %s
    """
    rows = fetch_all(query, (symbol, limit))
    return {
        "symbol": symbol,
        "signals": [dict(r) for r in rows],
    }


@router.get("/signals/latest")
async def get_latest_signal(symbol: str = Query(..., description="Symbol name")):
    query = """
        SELECT time, signal, confidence, model_version
        FROM trading_signals
        WHERE symbol = %s
        ORDER BY time DESC
        LIMIT 1
    """
    row = fetch_one(query, (symbol,))
    return {
        "symbol": symbol,
        "signal": dict(row) if row else None,
    }
