from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import fetch_one, execute

router = APIRouter(tags=["user-notification-preferences"])


class NotificationPrefsUpdate(BaseModel):
    price_alerts_enabled: Optional[bool] = None
    volume_alerts_enabled: Optional[bool] = None
    signal_change_alerts_enabled: Optional[bool] = None
    price_threshold: Optional[float] = None
    volume_threshold: Optional[int] = None
    signal_change_threshold: Optional[int] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None


@router.get("/user-notification-prefs/{user_id}")
async def get_notification_prefs(user_id: str):
    query = """
        SELECT * FROM user_notification_preferences
        WHERE user_id = %s
    """
    row = fetch_one(query, (user_id,))
    if not row:
        # Create default prefs
        insert_query = """
            INSERT INTO user_notification_preferences (user_id)
            VALUES (%s)
            RETURNING *
        """
        row = fetch_one(insert_query, (user_id,))
    return {"prefs": dict(row) if row else None}


@router.put("/user-notification-prefs/{user_id}")
async def update_notification_prefs(user_id: str, update: NotificationPrefsUpdate):
    # Upsert
    upsert_query = """
        INSERT INTO user_notification_preferences (user_id)
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
        UPDATE user_notification_preferences
        SET {', '.join(fields)}
        WHERE user_id = %s
        RETURNING *
    """
    row = fetch_one(query, tuple(params))
    return {"prefs": dict(row) if row else None}
