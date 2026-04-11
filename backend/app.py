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

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# DB init
Base.metadata.create_all(bind=engine)
ensure_database_schema()

app = FastAPI(
    title="AI Fitness Backend",
    version="4.0.0"
)

# 🔥 CRITICAL FIX: APPLY CORS IMMEDIATELY AFTER APP INIT
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔥 allow all (fixes your issue instantly)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(history_router)
app.include_router(workout_router)
app.include_router(nutrition_router)
app.include_router(chat_router)
app.include_router(health_router)

# Health check
@app.get("/")
def root():
    return {"status": "healthy", "service": "AI Fitness Backend"}

@app.get("/ping")
def ping():
    return {"status": "alive"}

# Logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    return response

# Run
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port)
