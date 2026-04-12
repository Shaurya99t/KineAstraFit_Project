from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

from routes.auth_routes import router as auth_router
from routes.profile_routes import router as profile_router
from routes.dashboard_routes import router as dashboard_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KineAstraFit Backend",
    version="1.0.0"
)

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

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(dashboard_router)

@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "AI Fitness Backend",
        "version": "1.0.0"
    }
