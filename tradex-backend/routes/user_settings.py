from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from database import fetch_one, execute

router = APIRouter(tags=["user-settings"])

VALID_THEMES = ["tradex", "claude", "nvidia", "ollama"]
VALID_CURRENCIES = ["INR", "USD", "EUR", "GBP"]
VALID_TIMEZONES = ["Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Tokyo"]
VALID_TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D", "1W", "1M"]
VALID_CHART_TYPES = ["candlestick", "line", "bar", "area"]


class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = Field(None, pattern=f"^({'|'.join(VALID_THEMES)})$")
    currency: Optional[str] = Field(None, pattern=f"^({'|'.join(VALID_CURRENCIES)})$")
    timezone: Optional[str] = Field(None, pattern=f"^({'|'.join(VALID_TIMEZONES)})$")
    language: Optional[str] = Field(None, pattern="^(en|hi|ta|te|mr)$")
    notifications_enabled: Optional[bool] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    default_timeframe: Optional[str] = Field(None, pattern=f"^({'|'.join(VALID_TIMEFRAMES)})$")
    chart_type: Optional[str] = Field(None, pattern=f"^({'|'.join(VALID_CHART_TYPES)})$")
    show_volume: Optional[bool] = None
    show_signals: Optional[bool] = None


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100, pattern="^[a-zA-Z0-9 ]*$")
    email: Optional[str] = Field(None, pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    phone: Optional[str] = Field(None, pattern=r"^\+?[0-9]{10,15}$")
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=255, pattern=r"^https?://.*$")


@router.get("/user-settings/{user_id}")
async def get_user_settings(user_id: str):
    try:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/user-settings/{user_id}")
async def update_user_settings(user_id: str, update: UserSettingsUpdate):
    try:
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/user-profile/{user_id}")
async def get_user_profile(user_id: str):
    try:
        query = "SELECT * FROM user_profiles WHERE user_id = %s"
        row = fetch_one(query, (user_id,))
        return {"profile": dict(row) if row else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/user-profile/{user_id}")
async def update_user_profile(user_id: str, update: UserProfileUpdate):
    try:
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/user-account/{user_id}")
async def delete_user_account(user_id: str):
    try:
        # Delete from all user-related tables
        delete_queries = [
            "DELETE FROM user_notification_preferences WHERE user_id = %s",
            "DELETE FROM user_settings WHERE user_id = %s",
            "DELETE FROM user_profiles WHERE user_id = %s",
        ]
        for query in delete_queries:
            execute(query, (user_id,))
        return {"message": "Account deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
