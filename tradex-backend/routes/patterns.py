from fastapi import APIRouter, Query
from database import fetch_all

router = APIRouter(tags=["patterns"])


@router.get("/patterns")
async def get_patterns(
    symbol: str = Query(None, description="Filter by symbol"),
    pattern_type: str = Query(None, description="Filter by pattern type"),
    limit: int = Query(20, ge=1, le=100, description="Max results"),
):
    # Pattern detection from candle data using simple heuristics
    conditions = []
    params = []

    if symbol:
        conditions.append("security_id = %s")
        params.append(symbol)

    where = "WHERE " + " AND ".join(conditions) if conditions else ""

    query = f"""
        SELECT
            security_id,
            instrument_type,
            timestamp,
            open,
            high,
            low,
            close,
            volume
        FROM candle_data
        {where}
        ORDER BY timestamp DESC
        LIMIT %s
    """
    params.append(limit * 5)  # Fetch more candles for pattern detection
    rows = fetch_all(query, tuple(params))

    patterns = _detect_patterns(rows)
    return {"patterns": patterns[:limit], "count": len(patterns[:limit])}


def _detect_patterns(rows):
    patterns = []
    if len(rows) < 5:
        return patterns

    # Group by security_id
    by_symbol = {}
    for r in rows:
        sid = r["security_id"]
        if sid not in by_symbol:
            by_symbol[sid] = []
        by_symbol[sid].append(r)

    for symbol, candles in by_symbol.items():
        if len(candles) < 5:
            continue

        closes = [float(c["close"]) for c in candles[:20]]
        highs = [float(c["high"]) for c in candles[:20]]
        lows = [float(c["low"]) for c in candles[:20]]

        # Simple pattern detection
        # 1. Three consecutive up/down (trend)
        if len(closes) >= 3:
            if all(closes[i] > closes[i+1] for i in range(3)):
                patterns.append({
                    "security_id": symbol,
                    "pattern_type": "uptrend",
                    "description": "3+ consecutive higher closes",
                    "confidence": 0.65,
                    "timestamp": str(candles[0]["timestamp"]),
                })
            elif all(closes[i] < closes[i+1] for i in range(3)):
                patterns.append({
                    "security_id": symbol,
                    "pattern_type": "downtrend",
                    "description": "3+ consecutive lower closes",
                    "confidence": 0.65,
                    "timestamp": str(candles[0]["timestamp"]),
                })

        # 2. Higher highs and higher lows (uptrend)
        if len(highs) >= 3 and len(lows) >= 3:
            hh = all(highs[i] > highs[i+1] for i in range(3))
            hl = all(lows[i] > lows[i+1] for i in range(3))
            if hh and hl:
                patterns.append({
                    "security_id": symbol,
                    "pattern_type": "higher-highs-lows",
                    "description": "Bullish structure: higher highs and higher lows",
                    "confidence": 0.72,
                    "timestamp": str(candles[0]["timestamp"]),
                })

            lh = all(highs[i] < highs[i+1] for i in range(3))
            ll = all(lows[i] < lows[i+1] for i in range(3))
            if lh and ll:
                patterns.append({
                    "security_id": symbol,
                    "pattern_type": "lower-highs-lows",
                    "description": "Bearish structure: lower highs and lower lows",
                    "confidence": 0.72,
                    "timestamp": str(candles[0]["timestamp"]),
                })

        # 3. Range consolidation (flat)
        if len(closes) >= 5:
            avg = sum(closes[:5]) / 5
            within_range = all(abs(c - avg) / avg < 0.01 for c in closes[:5])
            if within_range:
                patterns.append({
                    "security_id": symbol,
                    "pattern_type": "consolidation",
                    "description": "Price consolidating within 1% range",
                    "confidence": 0.60,
                    "timestamp": str(candles[0]["timestamp"]),
                })

    return patterns
