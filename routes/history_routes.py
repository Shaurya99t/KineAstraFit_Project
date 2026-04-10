"""
History route handlers.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User, UserHistory
from schemas import HistoryCreate, HistoryResponse

router = APIRouter(tags=["History"])


@router.get("/history", response_model=list[HistoryResponse])
async def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(UserHistory)
        .filter(UserHistory.user_id == current_user.id)
        .order_by(UserHistory.log_date.asc(), UserHistory.id.asc())
        .all()
    )


@router.post("/history", response_model=HistoryResponse)
async def create_history(
    history_data: HistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history_entry = UserHistory(
        user_id=current_user.id,
        log_date=history_data.log_date,
        weight=history_data.weight,
        previous_goal=history_data.previous_goal,
        weekly_performance=history_data.weekly_performance,
        streak_days=history_data.streak_days,
        calories_intake=history_data.calories_intake,
    )
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)
    return history_entry
