"""
Authentication route handlers.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import authenticate_user, create_access_token, hash_password
from database import get_db
from models import User, UserProfile
from schemas import LoginRequest, Token, UserCreate, UserResponse

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Authentication"])


def build_default_name(email: str) -> str:
    return email.split("@")[0].replace(".", " ").replace("_", " ").title()


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    new_user = User(email=user_data.email, password=hash_password(user_data.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials",
        )
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    user_name = profile.name if profile and profile.name else build_default_name(user.email)
    access_token = create_access_token(data={"sub": user.email, "name": user_name})
    return Token(access_token=access_token, token_type="bearer")
