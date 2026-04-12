"""
Profile route handlers.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User, UserProfile
from schemas import ProfileCreate, ProfileResponse
from services.nutrition_service import get_nutrition_plan
from services.profile_service import (
    create_history_snapshot,
    sync_profile_defaults,
)

router = APIRouter(tags=["Profile"])


def _get_or_create_profile(db: Session, user: User) -> UserProfile:
    """Get existing profile or create a blank one — never 404."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        profile = UserProfile(
            user_id=user.id,
            name=user.email.split("@")[0],
            email=user.email,
            age=25,
            weight=70,
            height=170,
            goal="fat loss",
            diet="veg",
            activity_level="moderate",
            fitness_level="beginner",
            region="india",
            target_weight=70,
            workout_preference="Push / Pull / Legs",
            memory_summary="User is just getting started.",
            completed_workouts=0,
            skipped_workouts=0,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("/profile", response_model=ProfileResponse)
@router.get("/profile/me", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(db, current_user)
    return sync_profile_defaults(profile, current_user, db)


@router.post("/profile", response_model=ProfileResponse)
@router.put("/profile", response_model=ProfileResponse)
async def upsert_profile(
    profile_data: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check email not used by another account
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    previous_goal = profile.goal if profile else profile_data.goal

    # Update user email
    current_user.email = profile_data.email
    db.add(current_user)

    if profile:
        # Update existing
        profile.name = profile_data.name
        profile.email = profile_data.email
        profile.age = profile_data.age
        profile.weight = profile_data.weight
        profile.height = profile_data.height
        profile.goal = profile_data.goal
        profile.diet = profile_data.diet
        profile.activity_level = profile_data.activity_level
        profile.fitness_level = profile_data.fitness_level
        profile.region = profile_data.region
        profile.target_weight = profile_data.target_weight
        profile.workout_preference = profile_data.workout_preference
        profile.medical_notes = profile_data.medical_notes
    else:
        # Create new
        profile = UserProfile(
            user_id=current_user.id,
            name=profile_data.name,
            email=profile_data.email,
            age=profile_data.age,
            weight=profile_data.weight,
            height=profile_data.height,
            goal=profile_data.goal,
            diet=profile_data.diet,
            activity_level=profile_data.activity_level,
            fitness_level=profile_data.fitness_level,
            region=profile_data.region,
            target_weight=profile_data.target_weight,
            workout_preference=profile_data.workout_preference,
            medical_notes=profile_data.medical_notes,
            memory_summary=(
                f"User prefers {profile_data.workout_preference} "
                f"and is focused on {profile_data.goal}."
            ),
            completed_workouts=0,
            skipped_workouts=0,
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)

    # Save history snapshot
    try:
        nutrition = get_nutrition_plan(profile)
        create_history_snapshot(
            db,
            user_id=current_user.id,
            weight=profile.weight,
            previous_goal=previous_goal,
            weekly_performance=0,
            streak_days=0,
            calories_intake=nutrition["calories"],
        )
    except Exception:
        pass  # Don't fail profile save if history snapshot fails

    return profile
