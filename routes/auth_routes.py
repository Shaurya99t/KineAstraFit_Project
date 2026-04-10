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
from services.profile_service import build_default_name

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Authentication"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"📝 Signup attempt for: {user_data.email}")
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        logger.warning(f"⚠️ Signup failed - User already exists: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    new_user = User(email=user_data.email, password=hash_password(user_data.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info(f"✅ User created: {user_data.email} (ID: {new_user.id})")
    return new_user


@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    logger.info(f"🔐 Login attempt for: {login_data.email}")
    print(f"\n🔐 [LOGIN] Email: {login_data.email}")
    
    try:
        user = authenticate_user(db, login_data.email, login_data.password)
        if not user:
            logger.warning(f"❌ Login failed - Invalid credentials: {login_data.email}")
            print(f"❌ [LOGIN] Invalid credentials for: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        user_name = profile.name if profile and profile.name else build_default_name(user.email)
        access_token = create_access_token(data={"sub": user.email, "name": user_name})
        logger.info(f"✅ Login successful: {login_data.email} (ID: {user.id})")
        print(f"✅ [LOGIN] Success for: {login_data.email} (User ID: {user.id})\n")
        return Token(access_token=access_token, token_type="bearer")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Login error: {str(e)}")
        print(f"💥 [LOGIN] Error: {str(e)}\n")
        raise
