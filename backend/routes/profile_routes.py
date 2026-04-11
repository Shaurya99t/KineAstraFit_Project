from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import UserProfile, User
from auth import get_current_user

router = APIRouter()


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not profile:
        profile = UserProfile(
            user_id=current_user.id,
            name=current_user.email.split("@")[0],
            email=current_user.email,
            goal="fitness",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {
        "user_id": profile.user_id,
        "name": profile.name,
        "email": profile.email,
        "goal": profile.goal,
        "region": "india",
        "weight": 70.0,
    }


@router.post("/profile")
def create_profile(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")

    profile = UserProfile(
        user_id=current_user.id,
        name=data.get("name"),
        email=data.get("email"),
        goal=data.get("goal"),
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {
        "user_id": profile.user_id,
        "name": profile.name,
        "email": profile.email,
        "goal": profile.goal,
        "region": "india",
        "weight": 70.0,
    }


@router.put("/profile")
def update_profile(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.name = data.get("name", profile.name)
    profile.email = data.get("email", profile.email)
    profile.goal = data.get("goal", profile.goal)

    db.commit()
    db.refresh(profile)

    return {
        "user_id": profile.user_id,
        "name": profile.name,
        "email": profile.email,
        "goal": profile.goal,
        "region": "india",
        "weight": 70.0,
    }
