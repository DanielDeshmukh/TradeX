from fastapi import APIRouter, Query
from database import fetch_all, fetch_one

router = APIRouter(tags=["symbols"])


@router.get("/symbols")
async def get_symbols():
    query = """
        SELECT display_name, symbol_name, exchange_id, instrument, security_id
        FROM master_symbols
        ORDER BY display_name
    """
    rows = fetch_all(query)
    return {
        "symbols": [dict(r) for r in rows],
    }


@router.get("/symbols/search")
async def search_symbols(q: str = Query(..., min_length=1, description="Search query")):
    query = """
        SELECT display_name, symbol_name, exchange_id, instrument, security_id
        FROM master_symbols
        WHERE symbol_name ILIKE %s OR display_name ILIKE %s
        ORDER BY display_name
        LIMIT 20
    """
    rows = fetch_all(query, (f"%{q}%", f"%{q}%"))
    return {
        "query": q,
        "symbols": [dict(r) for r in rows],
    }
