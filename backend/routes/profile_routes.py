from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import UserProfile, User
from auth import get_current_user

router = APIRouter()


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    # ✅ AUTO CREATE PROFILE
    if not profile:
        profile = UserProfile(
            user_id=current_user.id,
            name="New User",
            email=current_user.email,
            goal="fitness"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile
