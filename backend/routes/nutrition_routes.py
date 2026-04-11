"""
Nutrition route handlers.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import NutritionLog, User
from schemas import NutritionLogCreate, NutritionLogResponse, NutritionPlanResponse, NutritionSearchRequest, NutritionSearchResponse
from services.nutrition_service import get_nutrition_plan, search_food
from services.profile_service import get_profile_or_404, sync_profile_defaults

router = APIRouter(tags=["Nutrition"])


@router.get("/nutrition-plan", response_model=NutritionPlanResponse)
async def nutrition_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = sync_profile_defaults(get_profile_or_404(db, current_user.id), current_user, db)
    return get_nutrition_plan(profile)


@router.post("/nutrition", response_model=NutritionSearchResponse)
async def nutrition_search(
    payload: NutritionSearchRequest,
    current_user: User = Depends(get_current_user),
):
    return search_food(payload.query)


@router.post("/nutrition-log", response_model=NutritionLogResponse)
async def create_nutrition_log(
    log_data: NutritionLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = NutritionLog(
        user_id=current_user.id,
        food=log_data.food,
        calories=log_data.calories,
        protein=log_data.protein,
        carbs=log_data.carbs,
        fats=log_data.fats,
        date=log_data.date,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/nutrition-log", response_model=list[NutritionLogResponse])
async def get_nutrition_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(NutritionLog).filter(NutritionLog.user_id == current_user.id).order_by(NutritionLog.date.desc()).all()
