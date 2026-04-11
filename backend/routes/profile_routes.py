from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import UserProfile, User
from auth import get_current_user

router = APIRouter()


# ✅ GET PROFILE (AUTO CREATE)
@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not profile:
        profile = UserProfile(
    user_id=current_user.id,
    name="New User",
    email=current_user.email,
    goal="fitness",
    weight=70.0,
    region="india",
)
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


# ✅ CREATE PROFILE (POST)
@router.post("/profile")
def create_profile(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if profile:
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

    return profile


# ✅ UPDATE PROFILE (PUT) ← THIS FIXES YOUR ERROR
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

    return profile
