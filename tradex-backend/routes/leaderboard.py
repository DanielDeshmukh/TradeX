from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import fetch_one, fetch_all, execute

router = APIRouter(tags=["leaderboard"])


class TradingStatsUpdate(BaseModel):
    total_trades: Optional[int] = None
    winning_trades: Optional[int] = None
    losing_trades: Optional[int] = None
    total_return: Optional[float] = None
    win_rate: Optional[float] = None
    current_streak: Optional[int] = None
    best_streak: Optional[int] = None
    portfolio_value: Optional[float] = None


class Achievement(BaseModel):
    achievement_type: str
    achievement_name: str
    description: Optional[str] = None


@router.get("/leaderboard")
async def get_leaderboard(limit: int = 50):
    query = """
        SELECT user_id, total_trades, winning_trades, total_return,
               win_rate, current_streak, best_streak, portfolio_value
        FROM user_trading_stats
        ORDER BY win_rate DESC, total_return DESC
        LIMIT %s
    """
    rows = fetch_all(query, (limit,))
    leaderboard = []
    for i, row in enumerate(rows, 1):
        entry = dict(row)
        entry['rank'] = i
        leaderboard.append(entry)
    return {"leaderboard": leaderboard}


@router.get("/leaderboard/{user_id}")
async def get_user_rank(user_id: str):
    # Get user's stats
    stats_query = "SELECT * FROM user_trading_stats WHERE user_id = %s"
    stats = fetch_one(stats_query, (user_id,))
    
    if not stats:
        return {"rank": None, "stats": None, "total_users": 0}
    
    # Get user's rank
    rank_query = """
        SELECT COUNT(*) as rank FROM user_trading_stats
        WHERE win_rate > %s OR (win_rate = %s AND total_return > %s)
    """
    rank_result = fetch_one(rank_query, (stats['win_rate'], stats['win_rate'], stats['total_return']))
    
    # Get total users
    total_query = "SELECT COUNT(*) as total FROM user_trading_stats"
    total = fetch_one(total_query)
    
    return {
        "rank": rank_result['rank'] + 1 if rank_result else 1,
        "stats": dict(stats),
        "total_users": total['total'] if total else 0
    }


@router.put("/leaderboard/{user_id}")
async def update_trading_stats(user_id: str, stats: TradingStatsUpdate):
    try:
        # Upsert stats
        upsert_query = """
            INSERT INTO user_trading_stats (user_id)
            VALUES (%s)
            ON CONFLICT (user_id) DO NOTHING
        """
        execute(upsert_query, (user_id,))
        
        fields = []
        params = []
        for field, value in stats.model_dump(exclude_none=True).items():
            fields.append(f"{field} = %s")
            params.append(value)
        
        if fields:
            fields.append("updated_at = NOW()")
            params.append(user_id)
            query = f"""
                UPDATE user_trading_stats
                SET {', '.join(fields)}
                WHERE user_id = %s
                RETURNING *
            """
            row = fetch_one(query, tuple(params))
            return {"stats": dict(row) if row else None}
        
        return {"message": "No fields to update"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/achievements/{user_id}")
async def get_user_achievements(user_id: str):
    query = """
        SELECT * FROM user_achievements
        WHERE user_id = %s
        ORDER BY earned_at DESC
    """
    rows = fetch_all(query, (user_id,))
    return {"achievements": [dict(row) for row in rows]}


@router.post("/achievements/{user_id}")
async def add_achievement(user_id: str, achievement: Achievement):
    try:
        # Check if already exists
        check_query = """
            SELECT id FROM user_achievements
            WHERE user_id = %s AND achievement_type = %s
        """
        existing = fetch_one(check_query, (user_id, achievement.achievement_type))
        if existing:
            return {"message": "Achievement already earned"}
        
        insert_query = """
            INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        """
        row = fetch_one(insert_query, (
            user_id,
            achievement.achievement_type,
            achievement.achievement_name,
            achievement.description
        ))
        return {"achievement": dict(row) if row else None, "message": "Achievement earned"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/weekly-rankings")
async def get_weekly_rankings(week_start: Optional[str] = None):
    if week_start:
        query = """
            SELECT wr.*, uts.win_rate, uts.total_return
            FROM weekly_rankings wr
            JOIN user_trading_stats uts ON wr.user_id = uts.user_id
            WHERE wr.week_start = %s
            ORDER BY wr.rank ASC
        """
        rows = fetch_all(query, (week_start,))
    else:
        query = """
            SELECT wr.*, uts.win_rate, uts.total_return
            FROM weekly_rankings wr
            JOIN user_trading_stats uts ON wr.user_id = uts.user_id
            WHERE wr.week_start = (SELECT MAX(week_start) FROM weekly_rankings)
            ORDER BY wr.rank ASC
        """
        rows = fetch_all(query)
    return {"rankings": [dict(row) for row in rows]}


@router.post("/seed-leaderboard")
async def seed_leaderboard():
    demo_users = [
        ("demo-user", 150, 85, 65, 72.50, 8, 12, 150000.00),
        ("trader-pro", 320, 180, 140, 68.20, 15, 20, 280000.00),
        ("market-master", 450, 280, 170, 75.30, 22, 30, 420000.00),
        ("stock-ninja", 200, 110, 90, 65.80, 5, 10, 180000.00),
        ("bull-runner", 180, 100, 80, 70.10, 12, 18, 200000.00),
    ]
    
    for user_id, trades, wins, losses, win_rate, streak, best, value in demo_users:
        execute("""
            INSERT INTO user_trading_stats (user_id, total_trades, winning_trades, losing_trades, 
                                           win_rate, current_streak, best_streak, portfolio_value)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (user_id) DO NOTHING
        """, (user_id, trades, wins, losses, win_rate, streak, best, value))
    
    return {"message": "Leaderboard seeded with demo data"}
