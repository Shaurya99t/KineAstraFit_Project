from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from database import Base, engine

# ✅ ROUTES
from routes.auth_routes import router as auth_router
from routes.profile_routes import router as profile_router
from routes.dashboard_routes import router as dashboard_router  # 🔥 NEW

# ✅ CREATE TABLES
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KineAstraFit Backend",
    version="1.0.0"
)

# ✅ CORS CONFIG (FIXED)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://kine-astra-fit-project-oepq.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ INCLUDE ROUTES
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(dashboard_router)  # 🔥 IMPORTANT FIX

# ✅ ROOT
@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "AI Fitness Backend",
        "version": "1.0.0"
    }
