"""
Main FastAPI application for the AI fitness platform.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv

from database import Base, engine
from routes.auth_routes import router as auth_router
from routes.chat_routes import router as chat_router
from routes.health_routes import router as health_router
from routes.history_routes import router as history_router
from routes.nutrition_routes import router as nutrition_router
from routes.profile_routes import router as profile_router
from routes.workout_routes import router as workout_router
from services.profile_service import ensure_database_schema

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)
ensure_database_schema()

app = FastAPI(
    title="AI Fitness Backend",
    description="Production-ready backend for an intelligent AI fitness platform",
    version="4.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"📡 {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.info(f"✅ {request.method} {request.url.path} -> {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"❌ {request.method} {request.url.path} -> Error: {str(e)}")
        raise


app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(history_router)
app.include_router(workout_router)
app.include_router(nutrition_router)
app.include_router(chat_router)
app.include_router(health_router)


@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "AI Fitness Backend",
        "version": "4.0.0"
    }


@app.get("/ping")
def ping():
    return {"status": "alive", "message": "Backend is running"}
