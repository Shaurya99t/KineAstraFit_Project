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
        "fat": 70,
        "meal_plan": ["Breakfast", "Lunch", "Dinner"]
    }


@router.get("/workout-progress")
def get_workout_progress(current_user: User = Depends(get_current_user)):
    return {
        "progress": 45,
        "streak": 5,
        "workout_type": "Push Pull Legs"   # 🔥 REQUIRED FIX
    }


@router.get("/workout-log")
def get_workout_log(current_user: User = Depends(get_current_user)):
    return {
        "logs": [],
        "workout_type": "Push Pull Legs"   # 🔥 REQUIRED FIX
    }


@router.get("/history")
def get_history(current_user: User = Depends(get_current_user)):
    return {
        "history": []
    }


@router.get("/chat-history")
def get_chat_history(current_user: User = Depends(get_current_user)):
    return {
        "messages": []
    }
