from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["billing"])

MOCK_PLANS = {
    "free": {"id": "free", "name": "Free", "price": 0, "features": ["5 symbols", "basic charts", "delayed data"]},
    "pro": {"id": "pro", "name": "Pro", "price": 499, "features": ["unlimited symbols", "ML patterns", "real-time data", "AI signals"]},
    "enterprise": {"id": "enterprise", "name": "Enterprise", "price": 1999, "features": ["everything in pro", "API access", "custom ML", "5yr data", "team collab"]},
}

MOCK_SUBSCRIPTIONS = {
    "demo-user": {"plan": "free", "status": "active", "trial_ends": None, "current_period_start": None, "current_period_end": None},
}


class SubscribeRequest(BaseModel):
    user_id: str
    plan_id: str


@router.get("/billing/plans")
async def list_plans():
    return {"plans": list(MOCK_PLANS.values())}


@router.get("/billing/subscription/{user_id}")
async def get_subscription(user_id: str):
    sub = MOCK_SUBSCRIPTIONS.get(user_id)
    if not sub:
        sub = {"plan": "free", "status": "active", "trial_ends": None, "current_period_start": None, "current_period_end": None}
        MOCK_SUBSCRIPTIONS[user_id] = sub
    plan = MOCK_PLANS.get(sub["plan"], MOCK_PLANS["free"])
    return {"subscription": {**sub, "plan_details": plan}}


@router.post("/billing/subscribe")
async def subscribe(req: SubscribeRequest):
    if req.plan_id not in MOCK_PLANS:
        return {"error": "Invalid plan"}
    MOCK_SUBSCRIPTIONS[req.user_id] = {
        "plan": req.plan_id,
        "status": "active",
        "trial_ends": "2026-06-23",
        "current_period_start": "2026-06-16",
        "current_period_end": "2026-07-16",
    }
    return {"subscription": MOCK_SUBSCRIPTIONS[req.user_id], "message": "Subscribed successfully (mock)"}


@router.post("/billing/cancel/{user_id}")
async def cancel_subscription(user_id: str):
    if user_id in MOCK_SUBSCRIPTIONS:
        MOCK_SUBSCRIPTIONS[user_id]["status"] = "cancelled"
    return {"message": "Subscription cancelled (mock)"}
