import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from error_handling import APIError, api_error_handler, global_exception_handler

from routes.candles import router as candles_router
from routes.signals import router as signals_router
from routes.features import router as features_router
from routes.symbols import router as symbols_router
from routes.live_feed import router as live_feed_router
from routes.user_notification_prefs import router as notif_prefs_router
from routes.billing import router as billing_router
from routes.search import router as search_router
from routes.patterns import router as patterns_router
from routes.user_settings import router as user_settings_router
from routes.watchlist import router as watchlist_router
from routes.leaderboard import router as leaderboard_router
from routes.learning import router as learning_router

load_dotenv()

app = FastAPI(
    title="TradeX API",
    description="Backend API for TradeX trading platform",
    version="1.0.0",
)

app.add_exception_handler(APIError, api_error_handler)
app.add_exception_handler(Exception, global_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candles_router, prefix="/api")
app.include_router(signals_router, prefix="/api")
app.include_router(features_router, prefix="/api")
app.include_router(symbols_router, prefix="/api")
app.include_router(live_feed_router)
app.include_router(notif_prefs_router, prefix="/api")
app.include_router(billing_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(patterns_router, prefix="/api")
app.include_router(user_settings_router, prefix="/api")
app.include_router(watchlist_router, prefix="/api")
app.include_router(leaderboard_router, prefix="/api")
app.include_router(learning_router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
