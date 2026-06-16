from fastapi import APIRouter, Query
from database import fetch_all

router = APIRouter(tags=["features"])


@router.get("/features")
async def get_features(
    symbol: str = Query(..., description="Symbol name"),
    limit: int = Query(100, ge=1, le=500, description="Number of feature rows"),
):
    query = """
        SELECT *
        FROM features
        WHERE security_id = %s
        ORDER BY timestamp DESC
        LIMIT %s
    """
    rows = fetch_all(query, (symbol, limit))
    return {
        "symbol": symbol,
        "features": [dict(r) for r in reversed(rows)],
    }
