from fastapi import APIRouter, Depends
from auth import get_current_user
from models import User

router = APIRouter()


@router.get("/nutrition-plan")
def get_nutrition_plan(current_user: User = Depends(get_current_user)):
    return {
        "calories": 2200,
        "protein": 130,
        "carbs": 250,
        "fat": 70
    }


@router.get("/workout-progress")
def get_workout_progress(current_user: User = Depends(get_current_user)):
    return {
        "progress": 45,
        "streak": 5
    }


@router.get("/workout-log")
def get_workout_log(current_user: User = Depends(get_current_user)):
    return []


@router.get("/history")
def get_history(current_user: User = Depends(get_current_user)):
    return []


@router.get("/chat-history")
def get_chat_history(current_user: User = Depends(get_current_user)):
    return []
