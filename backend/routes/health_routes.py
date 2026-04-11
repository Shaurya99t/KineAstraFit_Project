"""
Health route handlers.
"""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Fitness Backend",
        "version": "4.0.0",
    }
