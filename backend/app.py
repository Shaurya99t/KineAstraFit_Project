# ============================================================
# DASHBOARD ROUTES — correct nested response shapes
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Decode JWT and return user email. Raises 401 if invalid."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/profile")
def get_profile(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": getattr(user, "name", user.email.split("@")[0]),
            "age": getattr(user, "age", None),
            "weight": getattr(user, "weight", None),
            "height": getattr(user, "height", None),
            "fitness_goal": getattr(user, "fitness_goal", "General Fitness"),
            "created_at": str(user.created_at) if hasattr(user, "created_at") else None,
        }
    }


@app.put("/profile")
def update_profile(
    profile_data: dict,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in profile_data.items():
        if hasattr(user, key):
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully", "user": {"email": user.email}}


@app.get("/workout-progress")
def get_workout_progress(current_user: str = Depends(get_current_user)):
    return {
        "workout": {
            "workout_type": "Push Pull Legs",
            "progress": 45,
            "current_week": 3,
            "total_weeks": 8,
            "completed_sessions": 12,
            "total_sessions": 24,
            "streak_days": 5,
            "last_workout": "2025-04-10",
            "next_workout": "Push Day",
            "intensity_level": "Intermediate",
            "calories_burned_week": 1850,
        }
    }


@app.get("/workout-log")
def get_workout_log(current_user: str = Depends(get_current_user)):
    return {
        "logs": [
            {
                "id": 1,
                "date": "2025-04-10",
                "exercise": "Bench Press",
                "sets": 4,
                "reps": 10,
                "weight": 80,
                "unit": "kg",
                "notes": "Felt strong today",
                "workout_type": "Push",
            },
            {
                "id": 2,
                "date": "2025-04-08",
                "exercise": "Deadlift",
                "sets": 3,
                "reps": 5,
                "weight": 120,
                "unit": "kg",
                "notes": "",
                "workout_type": "Pull",
            },
            {
                "id": 3,
                "date": "2025-04-06",
                "exercise": "Squat",
                "sets": 4,
                "reps": 8,
                "weight": 100,
                "unit": "kg",
                "notes": "Good depth",
                "workout_type": "Legs",
            },
        ],
        "total": 3,
    }


@app.get("/nutrition-plan")
def get_nutrition_plan(current_user: str = Depends(get_current_user)):
    return {
        "nutrition": {
            "daily_calories": 2400,
            "protein_g": 180,
            "carbs_g": 250,
            "fat_g": 70,
            "water_ml": 3000,
            "meals": [
                {
                    "meal": "Breakfast",
                    "time": "7:00 AM",
                    "calories": 600,
                    "items": ["Oats", "Eggs", "Banana", "Whey Protein"],
                },
                {
                    "meal": "Lunch",
                    "time": "1:00 PM",
                    "calories": 800,
                    "items": ["Chicken Breast", "Brown Rice", "Broccoli", "Olive Oil"],
                },
                {
                    "meal": "Pre-Workout",
                    "time": "4:30 PM",
                    "calories": 300,
                    "items": ["Apple", "Peanut Butter", "Coffee"],
                },
                {
                    "meal": "Dinner",
                    "time": "8:00 PM",
                    "calories": 700,
                    "items": ["Salmon", "Sweet Potato", "Spinach Salad"],
                },
            ],
            "supplements": ["Creatine 5g", "Vitamin D 2000IU", "Omega-3 1g"],
        }
    }


@app.get("/history")
def get_history(current_user: str = Depends(get_current_user)):
    return {
        "history": [
            {
                "id": 1,
                "date": "2025-04-10",
                "workout_type": "Push",
                "duration_minutes": 65,
                "calories_burned": 450,
                "exercises_completed": 6,
                "performance_score": 85,
            },
            {
                "id": 2,
                "date": "2025-04-08",
                "workout_type": "Pull",
                "duration_minutes": 55,
                "calories_burned": 400,
                "exercises_completed": 5,
                "performance_score": 78,
            },
            {
                "id": 3,
                "date": "2025-04-06",
                "workout_type": "Legs",
                "duration_minutes": 70,
                "calories_burned": 520,
                "exercises_completed": 7,
                "performance_score": 90,
            },
        ],
        "total": 3,
        "weekly_summary": {
            "total_workouts": 3,
            "total_calories_burned": 1370,
            "avg_duration_minutes": 63,
            "avg_performance_score": 84,
        },
    }


@app.get("/chat-history")
def get_chat_history(current_user: str = Depends(get_current_user)):
    return {
        "chat_history": [],
        "total": 0,
    }
