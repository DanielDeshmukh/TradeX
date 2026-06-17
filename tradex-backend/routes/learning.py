from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database import fetch_one, fetch_all, execute

router = APIRouter(tags=["learning"])

COURSES = [
    {
        "id": "trading-basics",
        "title": "Trading Basics",
        "chapters": [
            {"id": "intro", "title": "Introduction to Trading", "order": 1},
            {"id": "markets", "title": "Understanding Markets", "order": 2},
            {"id": "orders", "title": "Types of Orders", "order": 3},
            {"id": "analysis", "title": "Technical vs Fundamental", "order": 4},
        ]
    },
    {
        "id": "technical-analysis",
        "title": "Technical Analysis",
        "chapters": [
            {"id": "charts", "title": "Chart Patterns", "order": 1},
            {"id": "indicators", "title": "Technical Indicators", "order": 2},
            {"id": "support-resistance", "title": "Support & Resistance", "order": 3},
            {"id": "trends", "title": "Trend Analysis", "order": 4},
        ]
    },
    {
        "id": "risk-management",
        "title": "Risk Management",
        "chapters": [
            {"id": "position-sizing", "title": "Position Sizing", "order": 1},
            {"id": "stop-loss", "title": "Stop Loss Strategies", "order": 2},
            {"id": "portfolio", "title": "Portfolio Management", "order": 3},
            {"id": "psychology", "title": "Trading Psychology", "order": 4},
        ]
    },
    {
        "id": "ml-trading",
        "title": "ML in Trading",
        "chapters": [
            {"id": "ml-intro", "title": "Introduction to ML", "order": 1},
            {"id": "features", "title": "Feature Engineering", "order": 2},
            {"id": "models", "title": "Trading Models", "order": 3},
            {"id": "backtesting", "title": "Backtesting Strategies", "order": 4},
        ]
    },
    {
        "id": "indian-market",
        "title": "Indian Market Specifics",
        "chapters": [
            {"id": "nse-bse", "title": "NSE vs BSE", "order": 1},
            {"id": "sectors", "title": "Market Sectors", "order": 2},
            {"id": "regulations", "title": "SEBI Regulations", "order": 3},
            {"id": "taxation", "title": "Taxation Rules", "order": 4},
        ]
    },
    {
        "id": "advanced-strategies",
        "title": "Advanced Strategies",
        "chapters": [
            {"id": "options", "title": "Options Trading", "order": 1},
            {"id": "futures", "title": "Futures Trading", "order": 2},
            {"id": "arbitrage", "title": "Arbitrage Strategies", "order": 3},
            {"id": "quantitative", "title": "Quantitative Analysis", "order": 4},
        ]
    },
]


class ChapterComplete(BaseModel):
    time_spent_seconds: Optional[int] = 0


class QuizSubmit(BaseModel):
    score: int
    total_questions: int


class LearningPathCreate(BaseModel):
    path_name: str
    courses: List[str]


@router.get("/courses")
async def list_courses():
    return {"courses": COURSES}


@router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = next((c for c in COURSES if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"course": course}


@router.get("/progress/{user_id}")
async def get_user_progress(user_id: str):
    query = """
        SELECT * FROM course_progress
        WHERE user_id = %s
        ORDER BY course_id, chapter_id
    """
    rows = fetch_all(query, (user_id,))
    progress = {}
    for row in rows:
        r = dict(row)
        if r['course_id'] not in progress:
            progress[r['course_id']] = []
        progress[r['course_id']].append(r)
    return {"progress": progress}


@router.post("/progress/{user_id}/{course_id}/{chapter_id}")
async def mark_chapter_complete(user_id: str, course_id: str, chapter_id: str, data: ChapterComplete):
    try:
        upsert_query = """
            INSERT INTO course_progress (user_id, course_id, chapter_id, completed, completed_at, time_spent_seconds)
            VALUES (%s, %s, %s, true, NOW(), %s)
            ON CONFLICT (user_id, course_id, chapter_id) 
            DO UPDATE SET completed = true, completed_at = NOW(), 
                         time_spent_seconds = course_progress.time_spent_seconds + EXCLUDED.time_spent_seconds
            RETURNING *
        """
        row = fetch_one(upsert_query, (user_id, course_id, chapter_id, data.time_spent_seconds or 0))
        return {"progress": dict(row) if row else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/quiz/{user_id}/{course_id}")
async def get_quiz_results(user_id: str, course_id: str):
    query = """
        SELECT * FROM quiz_results
        WHERE user_id = %s AND course_id = %s
        ORDER BY attempted_at DESC
    """
    rows = fetch_all(query, (user_id, course_id))
    return {"results": [dict(row) for row in rows]}


@router.post("/quiz/{user_id}/{course_id}/{quiz_id}")
async def submit_quiz(user_id: str, course_id: str, quiz_id: str, data: QuizSubmit):
    try:
        passed = (data.score / data.total_questions) >= 0.7 if data.total_questions > 0 else False
        upsert_query = """
            INSERT INTO quiz_results (user_id, course_id, quiz_id, score, total_questions, passed)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (user_id, course_id, quiz_id)
            DO UPDATE SET score = EXCLUDED.score, total_questions = EXCLUDED.total_questions,
                         passed = EXCLUDED.passed, attempted_at = NOW()
            RETURNING *
        """
        row = fetch_one(upsert_query, (user_id, course_id, quiz_id, data.score, data.total_questions, passed))
        return {"result": dict(row) if row else None, "passed": passed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/certificates/{user_id}")
async def get_certificates(user_id: str):
    query = """
        SELECT * FROM certificates
        WHERE user_id = %s
        ORDER BY issued_at DESC
    """
    rows = fetch_all(query, (user_id,))
    return {"certificates": [dict(row) for row in rows]}


@router.post("/certificates/{user_id}/{course_id}")
async def issue_certificate(user_id: str, course_id: str):
    try:
        # Check if already issued
        check_query = """
            SELECT id FROM certificates
            WHERE user_id = %s AND course_id = %s
        """
        existing = fetch_one(check_query, (user_id, course_id))
        if existing:
            return {"message": "Certificate already issued"}
        
        # Check if course is completed
        progress_query = """
            SELECT COUNT(*) as total,
                   COUNT(CASE WHEN completed THEN 1 END) as completed
            FROM course_progress
            WHERE user_id = %s AND course_id = %s
        """
        progress = fetch_one(progress_query, (user_id, course_id))
        if progress and progress['total'] > 0 and progress['total'] == progress['completed']:
            insert_query = """
                INSERT INTO certificates (user_id, course_id, certificate_url)
                VALUES (%s, %s, %s)
                RETURNING *
            """
            cert_url = f"/certificates/{user_id}/{course_id}.pdf"
            row = fetch_one(insert_query, (user_id, course_id, cert_url))
            return {"certificate": dict(row) if row else None, "message": "Certificate issued"}
        else:
            return {"message": "Course not yet completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/paths/{user_id}")
async def get_learning_paths(user_id: str):
    query = """
        SELECT * FROM learning_paths
        WHERE user_id = %s
        ORDER BY started_at DESC
    """
    rows = fetch_all(query, (user_id,))
    return {"paths": [dict(row) for row in rows]}


@router.post("/paths/{user_id}")
async def create_learning_path(user_id: str, data: LearningPathCreate):
    try:
        insert_query = """
            INSERT INTO learning_paths (user_id, path_name, courses)
            VALUES (%s, %s, %s::jsonb)
            RETURNING *
        """
        import json
        row = fetch_one(insert_query, (user_id, data.path_name, json.dumps(data.courses)))
        return {"path": dict(row) if row else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
