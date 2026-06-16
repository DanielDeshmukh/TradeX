from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, Query
from database import fetch_all, fetch_one

router = APIRouter(tags=["signals"])


@router.get("/signals")
async def get_signals(
    symbol: str = Query(..., description="Symbol name"),
    limit: int = Query(50, ge=1, le=200, description="Number of signals"),
):
    query = """
        SELECT created_at, signal, confidence, model_version
        FROM trading_signals
        WHERE security_id = %s
        ORDER BY created_at DESC
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
        SELECT created_at, signal, confidence, model_version
        FROM trading_signals
        WHERE security_id = %s
        ORDER BY created_at DESC
        LIMIT 1
    """
    row = fetch_one(query, (symbol,))
    return {
        "symbol": symbol,
        "signal": dict(row) if row else None,
    }


@router.get("/signals/all")
async def get_all_latest_signals():
    query = """
        SELECT DISTINCT ON (security_id)
            security_id, signal, confidence, model_version, created_at
        FROM trading_signals
        ORDER BY security_id, created_at DESC
    """
    rows = fetch_all(query)
    return {
        "signals": [dict(r) for r in rows],
    }


@router.get("/signals/history")
async def get_signal_history(
    symbol: Optional[str] = Query(None, description="Filter by symbol"),
    signal_type: Optional[str] = Query(None, description="Filter by signal type (buy/sell/hold)"),
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=200, description="Results per page"),
):
    conditions = []
    params = []

    if symbol:
        conditions.append("security_id = %s")
        params.append(symbol)
    if signal_type:
        conditions.append("signal = %s")
        params.append(signal_type)
    if start_date:
        conditions.append("created_at >= %s")
        params.append(start_date)
    if end_date:
        conditions.append("created_at < %s + INTERVAL '1 day'")
        params.append(end_date)

    where = "WHERE " + " AND ".join(conditions) if conditions else ""
    offset = (page - 1) * page_size

    count_query = f"SELECT COUNT(*) FROM trading_signals {where}"
    total = fetch_one(count_query, tuple(params))["count"]

    query = f"""
        SELECT security_id, signal, confidence, model_version, created_at
        FROM trading_signals
        {where}
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
    """
    rows = fetch_all(query, tuple(params) + (page_size, offset))

    return {
        "signals": [dict(r) for r in rows],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size,
        },
    }
