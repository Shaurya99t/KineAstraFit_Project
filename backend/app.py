from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging

from database import Base, engine

from routes.auth_routes import router as auth_router
from routes.profile_routes import router as profile_router
from routes.history_routes import router as history_router
from routes.workout_routes import router as workout_router
from routes.nutrition_routes import router as nutrition_router
from routes.chat_routes import router as chat_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    return response

# ✅ IMPORTANT — ALL ROUTES REGISTERED
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(history_router)
app.include_router(workout_router)
app.include_router(nutrition_router)
app.include_router(chat_router)

@app.get("/")
def root():
    return {"status": "ok"}
