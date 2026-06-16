from fastapi import APIRouter, Query
from database import fetch_all

router = APIRouter(tags=["search"])


@router.get("/search")
async def search_symbols(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Max results"),
):
    query = """
        SELECT DISTINCT security_id, instrument_type, exchange_segment
        FROM candle_data
        WHERE security_id ILIKE %s
        ORDER BY security_id
        LIMIT %s
    """
    pattern = f"%{q}%"
    rows = fetch_all(query, (pattern, limit))

    results = []
    for r in rows:
        results.append({
            "security_id": r["security_id"],
            "instrument_type": r["instrument_type"],
            "exchange_segment": r["exchange_segment"],
        })

    return {"query": q, "results": results, "count": len(results)}
