from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import UserProfile, User
from auth import get_current_user

router = APIRouter()

@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    # ✅ AUTO CREATE PROFILE (CRITICAL FIX)
    if not profile:
        profile = UserProfile(
            user_id=current_user.id,
            email=current_user.email
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


@router.post("/profile")
@router.put("/profile")
def save_profile(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    for key, value in data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    return profile
