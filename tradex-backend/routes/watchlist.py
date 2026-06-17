from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database import fetch_one, fetch_all, execute

router = APIRouter(tags=["watchlist"])


class WatchlistAdd(BaseModel):
    security_id: str
    display_name: Optional[str] = None
    symbol_name: Optional[str] = None
    exchange_id: Optional[str] = None
    instrument: Optional[str] = None


class WatchlistReorder(BaseModel):
    items: List[dict]


@router.get("/watchlist/{user_id}")
async def get_watchlist(user_id: str):
    query = """
        SELECT * FROM user_watchlist
        WHERE user_id = %s
        ORDER BY sort_order ASC, created_at ASC
    """
    rows = fetch_all(query, (user_id,))
    return {"watchlist": [dict(row) for row in rows]}


@router.post("/watchlist/{user_id}")
async def add_to_watchlist(user_id: str, item: WatchlistAdd):
    try:
        # Check if already exists
        check_query = """
            SELECT id FROM user_watchlist
            WHERE user_id = %s AND security_id = %s
        """
        existing = fetch_one(check_query, (user_id, item.security_id))
        if existing:
            raise HTTPException(status_code=409, detail="Symbol already in watchlist")

        # Get max sort order
        max_order_query = """
            SELECT COALESCE(MAX(sort_order), 0) as max_order
            FROM user_watchlist WHERE user_id = %s
        """
        max_order = fetch_one(max_order_query, (user_id,))

        insert_query = """
            INSERT INTO user_watchlist (user_id, security_id, display_name, symbol_name, exchange_id, instrument, sort_order)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """
        row = fetch_one(insert_query, (
            user_id,
            item.security_id,
            item.display_name,
            item.symbol_name,
            item.exchange_id,
            item.instrument,
            max_order['max_order'] + 1 if max_order else 1
        ))
        return {"item": dict(row) if row else None, "message": "Added to watchlist"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/watchlist/{user_id}/{security_id}")
async def remove_from_watchlist(user_id: str, security_id: str):
    try:
        query = """
            DELETE FROM user_watchlist
            WHERE user_id = %s AND security_id = %s
            RETURNING *
        """
        row = fetch_one(query, (user_id, security_id))
        if not row:
            raise HTTPException(status_code=404, detail="Symbol not found in watchlist")
        return {"message": "Removed from watchlist", "removed": dict(row)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/watchlist/{user_id}/reorder")
async def reorder_watchlist(user_id: str, data: WatchlistReorder):
    try:
        for item in data.items:
            query = """
                UPDATE user_watchlist
                SET sort_order = %s
                WHERE user_id = %s AND security_id = %s
            """
            execute(query, (item.get('sort_order', 0), user_id, item.get('security_id', '')))
        return {"message": "Watchlist reordered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/watchlist/{user_id}/search")
async def search_watchlist(user_id: str, q: str = ""):
    if not q:
        return {"watchlist": []}
    query = """
        SELECT * FROM user_watchlist
        WHERE user_id = %s AND (
            display_name ILIKE %s OR
            symbol_name ILIKE %s OR
            security_id ILIKE %s
        )
        ORDER BY sort_order ASC
    """
    search_term = f"%{q}%"
    rows = fetch_all(query, (user_id, search_term, search_term, search_term))
    return {"watchlist": [dict(row) for row in rows]}
