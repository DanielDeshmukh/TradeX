import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.candles import router as candles_router
from routes.signals import router as signals_router
from routes.features import router as features_router
from routes.symbols import router as symbols_router

load_dotenv()

app = FastAPI(
    title="TradeX API",
    description="Backend API for TradeX trading platform",
    version="1.0.0",
)

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


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
