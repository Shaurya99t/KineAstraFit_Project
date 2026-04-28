from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging

from database import Base, engine, SessionLocal
from models import User

from routes.auth_routes import router as auth_router
from routes.profile_routes import router as profile_router
from routes.history_routes import router as history_router
from routes.workout_routes import router as workout_router
from routes.nutrition_routes import router as nutrition_router
from routes.chat_routes import router as chat_router

# =========================
# CREATE TABLES
# =========================
Base.metadata.create_all(bind=engine)

# =========================
# FASTAPI INIT
# =========================
app = FastAPI()

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# LOGGING
# =========================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    return response


# =========================
# 🔥 TEMP FIX: RESET USERS
# =========================
@app.on_event("startup")
def nuke_users():
    db = SessionLocal()
    db.query(User).delete()
    db.commit()
    db.close()


# =========================
# ROUTES
# =========================
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(history_router)
app.include_router(workout_router)
app.include_router(nutrition_router)
app.include_router(chat_router)


# =========================
# ROOT
# =========================
@app.get("/")
def root():
    return {"status": "ok", "message": "Backend running"}
