"""
Workout logging and progress routes.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User, UserHistory, WorkoutLog
from schemas import WorkoutLogCreate, WorkoutLogResponse, WorkoutProgressResponse
from services.profile_service import get_profile_or_404, sync_adherence_metrics, sync_profile_defaults
from services.workout_service import (
    build_calories_progress,
    build_weekly_consistency,
    build_weight_progress,
    calculate_fatigue,
    calculate_streak_days,
    calculate_workout_intensity,
    generate_daily_plan,
    generate_weekly_plan,
    get_completion_rate,
)

router = APIRouter(tags=["Workouts"])


@router.post("/workout-log", response_model=WorkoutLogResponse)
async def create_workout_log(
    log_data: WorkoutLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = WorkoutLog(
        user_id=current_user.id,
        exercise_name=log_data.exercise_name,
        sets=log_data.sets,
        reps=log_data.reps,
        weight=log_data.weight,
        date=log_data.date,
        intensity=calculate_workout_intensity(log_data.sets, log_data.reps, log_data.weight),
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    profile = sync_profile_defaults(get_profile_or_404(db, current_user.id), current_user, db)
    all_logs = (
        db.query(WorkoutLog)
        .filter(WorkoutLog.user_id == current_user.id)
        .order_by(WorkoutLog.date.asc(), WorkoutLog.id.asc())
        .all()
    )
    profile.last_active_date = log.date
    sync_adherence_metrics(profile, all_logs, db)

    return log


@router.get("/workout-log", response_model=list[WorkoutLogResponse])
async def get_workout_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(WorkoutLog)
        .filter(WorkoutLog.user_id == current_user.id)
        .order_by(WorkoutLog.date.desc(), WorkoutLog.id.desc())
        .limit(100)
        .all()
    )


@router.get("/workout-progress", response_model=WorkoutProgressResponse)
async def get_workout_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = sync_profile_defaults(get_profile_or_404(db, current_user.id), current_user, db)
    logs = (
        db.query(WorkoutLog)
        .filter(WorkoutLog.user_id == current_user.id)
        .order_by(WorkoutLog.date.asc(), WorkoutLog.id.asc())
        .all()
    )
    history = (
        db.query(UserHistory)
        .filter(UserHistory.user_id == current_user.id)
        .order_by(UserHistory.log_date.asc(), UserHistory.id.asc())
        .all()
    )

    profile = sync_adherence_metrics(profile, logs, db)
    fatigue = calculate_fatigue(profile, logs)
    return WorkoutProgressResponse(
        fatigue=fatigue,
        completion_rate=get_completion_rate(profile),
        streak_days=calculate_streak_days(logs),
        completed_workouts=profile.completed_workouts or 0,
        skipped_workouts=profile.skipped_workouts or 0,
        daily_plan=generate_daily_plan(profile, history, fatigue),
        weekly_plan=generate_weekly_plan(profile, fatigue),
        weight_progress=build_weight_progress(history),
        weekly_consistency=build_weekly_consistency(logs),
        calories_progress=build_calories_progress(history),
    )
