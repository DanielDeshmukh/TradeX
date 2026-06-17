from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import fetch_one, execute

router = APIRouter(tags=["user-settings"])


class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    default_timeframe: Optional[str] = None
    chart_type: Optional[str] = None
    show_volume: Optional[bool] = None
    show_signals: Optional[bool] = None


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None


@router.get("/user-settings/{user_id}")
async def get_user_settings(user_id: str):
    query = "SELECT * FROM user_settings WHERE user_id = %s"
    row = fetch_one(query, (user_id,))
    if not row:
        # Create default settings
        insert_query = """
            INSERT INTO user_settings (user_id)
            VALUES (%s)
            RETURNING *
        """
        row = fetch_one(insert_query, (user_id,))
    return {"settings": dict(row) if row else None}


@router.put("/user-settings/{user_id}")
async def update_user_settings(user_id: str, update: UserSettingsUpdate):
    # Upsert
    upsert_query = """
        INSERT INTO user_settings (user_id)
        VALUES (%s)
        ON CONFLICT (user_id) DO NOTHING
    """
    execute(upsert_query, (user_id,))

    fields = []
    params = []
    for field, value in update.model_dump(exclude_none=True).items():
        fields.append(f"{field} = %s")
        params.append(value)

    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    fields.append("updated_at = NOW()")
    params.append(user_id)

    query = f"""
        UPDATE user_settings
        SET {', '.join(fields)}
        WHERE user_id = %s
        RETURNING *
    """
    row = fetch_one(query, tuple(params))
    return {"settings": dict(row) if row else None}


@router.get("/user-profile/{user_id}")
async def get_user_profile(user_id: str):
    query = "SELECT * FROM user_profiles WHERE user_id = %s"
    row = fetch_one(query, (user_id,))
    return {"profile": dict(row) if row else None}


@router.put("/user-profile/{user_id}")
async def update_user_profile(user_id: str, update: UserProfileUpdate):
    # Upsert
    upsert_query = """
        INSERT INTO user_profiles (user_id)
        VALUES (%s)
        ON CONFLICT (user_id) DO NOTHING
    """
    execute(upsert_query, (user_id,))

    fields = []
    params = []
    for field, value in update.model_dump(exclude_none=True).items():
        fields.append(f"{field} = %s")
        params.append(value)

    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    fields.append("updated_at = NOW()")
    params.append(user_id)

    query = f"""
        UPDATE user_profiles
        SET {', '.join(fields)}
        WHERE user_id = %s
        RETURNING *
    """
    row = fetch_one(query, tuple(params))
    return {"profile": dict(row) if row else None}


@router.delete("/user-account/{user_id}")
async def delete_user_account(user_id: str):
    # Delete from all user-related tables
    delete_queries = [
        "DELETE FROM user_notification_preferences WHERE user_id = %s",
        "DELETE FROM user_settings WHERE user_id = %s",
        "DELETE FROM user_profiles WHERE user_id = %s",
    ]
    for query in delete_queries:
        execute(query, (user_id,))
    return {"message": "Account deleted successfully"}
