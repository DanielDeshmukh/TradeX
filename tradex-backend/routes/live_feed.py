from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from database import fetch_all

router = APIRouter(tags=["live_feed"])


class LiveFeedRequest(BaseModel):
    security_id: str
    exchange: Optional[str] = "NSE"
    instrument_type: Optional[str] = "EQUITY"
    symbolName: Optional[str] = None


@router.post("/live_feed")
async def live_feed(req: LiveFeedRequest):
    query = """
        SELECT timestamp, open, high, low, close, volume
        FROM candles
        WHERE security_id = %s AND timeframe = '1min'
        ORDER BY timestamp DESC
        LIMIT 500
    """
    rows = fetch_all(query, (req.symbolName or req.security_id,))
    candles = [dict(r) for r in reversed(rows)]
    return {"status": "success", "data": candles}
