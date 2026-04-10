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

# Load environment variables
load_dotenv()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize DB
Base.metadata.create_all(bind=engine)
ensure_database_schema()

# Create app
app = FastAPI(
    title="AI Fitness Backend",
    description="Production-ready backend for an intelligent AI fitness platform",
    version="4.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ================== CORS FIX (IMPORTANT) ==================
ENV = os.getenv("ENV", "production")

if ENV == "dev":
    # Allow everything in dev
    allowed_origins = ["*"]
    logger.info("🔓 CORS: Development mode - allowing all origins")

else:
    # Production mode (Vercel + Render)
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "https://kineastrafit-app.onrender.com",  # backend itself
    ]

    # Add Vercel frontend dynamically
    if os.getenv("ALLOWED_ORIGINS"):
        prod_origins = os.getenv("ALLOWED_ORIGINS").split(",")
        allowed_origins.extend([origin.strip() for origin in prod_origins])

    # 🔥 TEMP: Allow all (SAFE FIX for now)
    allowed_origins = ["*"]

    logger.info("🌍 CORS: Production mode - allowing all origins (temporary)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"✅ CORS enabled for: {allowed_origins}")

# ================== REQUEST LOGGER ==================
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

# ================== ROUTES ==================
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(history_router)
app.include_router(workout_router)
app.include_router(nutrition_router)
app.include_router(chat_router)
app.include_router(health_router)

# ================== HEALTH CHECK ==================
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

# ================== RUN ==================
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    debug_mode = ENV == "dev"
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=debug_mode)
