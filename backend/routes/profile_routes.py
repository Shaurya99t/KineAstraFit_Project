from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import UserProfile, User
from auth import get_current_user

router = APIRouter()


def profile_to_dict(profile):
    return {
        "user_id": profile.user_id,
        "name": profile.name,
        "email": profile.email,
        "goal": profile.goal,
        "diet": profile.diet,
        "activity_level": profile.activity_level,
        "fitness_level": profile.fitness_level,
        "region": profile.region,
        "age": profile.age,
        "weight": profile.weight,
        "height": profile.height,
        "target_weight": profile.target_weight,
        "workout_preference": profile.workout_preference,
        "medical_notes": profile.medical_notes,
        "memory_summary": profile.memory_summary,
    }


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not profile:
        profile = UserProfile(
            user_id=current_user.id,
            name=current_user.email.split("@")[0],
            email=current_user.email,
            goal="fat loss",
            diet="veg",
            activity_level="moderate",
            fitness_level="beginner",
            region="india",
            workout_preference="Push / Pull / Legs",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile_to_dict(profile)


@router.put("/profile")
def update_profile(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    profile.name = data.get("name", profile.name)
    profile.email = data.get("email", profile.email)
    profile.goal = data.get("goal", profile.goal)
    profile.diet = data.get("diet", profile.diet)
    profile.activity_level = data.get("activity_level", profile.activity_level)
    profile.fitness_level = data.get("fitness_level", profile.fitness_level)
    profile.region = data.get("region", profile.region)
    profile.age = data.get("age", profile.age)
    profile.weight = data.get("weight", profile.weight)
    profile.height = data.get("height", profile.height)
    profile.target_weight = data.get("target_weight", profile.target_weight)
    profile.workout_preference = data.get("workout_preference", profile.workout_preference)
    profile.medical_notes = data.get("medical_notes", profile.medical_notes)

    db.commit()
    db.refresh(profile)

    return profile_to_dict(profile)


@router.post("/profile")
def create_profile(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")

    profile = UserProfile(
        user_id=current_user.id,
        name=data.get("name"),
        email=data.get("email"),
        goal=data.get("goal", "fat loss"),
        diet=data.get("diet", "veg"),
        activity_level=data.get("activity_level", "moderate"),
        fitness_level=data.get("fitness_level", "beginner"),
        region=data.get("region", "india"),
        age=data.get("age"),
        weight=data.get("weight"),
        height=data.get("height"),
        target_weight=data.get("target_weight"),
        workout_preference=data.get("workout_preference", "Push / Pull / Legs"),
        medical_notes=data.get("medical_notes"),
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile_to_dict(profile)
