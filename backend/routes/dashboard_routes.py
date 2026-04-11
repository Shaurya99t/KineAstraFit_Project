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
    }


@router.get("/workout-progress")
def get_workout_progress(current_user: User = Depends(get_current_user)):
    return {
        "fatigue": 35,
        "completion_rate": 72,
        "streak_days": 5,
        "completed_workouts": 12,
        "skipped_workouts": 2,
        "daily_plan": {
            "workout_type": "Push Day",
            "intensity": "Moderate",
            "tip": "Focus on mind-muscle connection",
            "steps_goal": 8000,
            "water_intake": 3.0,
        },
        "weekly_plan": [],
        "weight_progress": [
            {"date": "Apr 6", "weight": 74.5},
            {"date": "Apr 7", "weight": 74.3},
            {"date": "Apr 8", "weight": 74.1},
            {"date": "Apr 9", "weight": 74.0},
            {"date": "Apr 10", "weight": 73.8},
        ],
        "weekly_consistency": [
            {"week": "W1", "sessions": 3},
            {"week": "W2", "sessions": 4},
            {"week": "W3", "sessions": 3},
            {"week": "W4", "sessions": 5},
            {"week": "W5", "sessions": 4},
            {"week": "W6", "sessions": 3},
        ],
        "calories_progress": [
            {"date": "Apr 6", "calories": 2100},
            {"date": "Apr 7", "calories": 2300},
            {"date": "Apr 8", "calories": 1950},
            {"date": "Apr 9", "calories": 2200},
            {"date": "Apr 10", "calories": 2050},
        ],
    }


@router.get("/workout-log")
def get_workout_log(current_user: User = Depends(get_current_user)):
    return []


@router.get("/history")
def get_history(current_user: User = Depends(get_current_user)):
    return []


@router.get("/chat-history")
def get_chat_history(current_user: User = Depends(get_current_user)):
    return {"messages": []}
