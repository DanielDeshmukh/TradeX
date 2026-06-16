from fastapi import APIRouter, Query
from database import fetch_all, fetch_one

router = APIRouter(tags=["symbols"])


@router.get("/symbols")
async def get_symbols():
    query = """
        SELECT DISTINCT symbol, exchange, instrument_type
        FROM master_symbols
        ORDER BY symbol
    """
    rows = fetch_all(query)
    return {
        "symbols": [dict(r) for r in rows],
    }


@router.get("/symbols/search")
async def search_symbols(q: str = Query(..., min_length=1, description="Search query")):
    query = """
        SELECT DISTINCT symbol, exchange, instrument_type
        FROM master_symbols
        WHERE symbol ILIKE %s
        ORDER BY symbol
        LIMIT 20
    """
    rows = fetch_all(query, (f"%{q}%",))
    return {
        "query": q,
        "symbols": [dict(r) for r in rows],
    }
