"""
Shared profile, schema-migration, and persistence helpers.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from database import engine
from models import ChatHistory, UserHistory, UserProfile


def ensure_database_schema() -> None:
    profile_columns = {
        "name": "ALTER TABLE user_profiles ADD COLUMN name VARCHAR",
        "email": "ALTER TABLE user_profiles ADD COLUMN email VARCHAR",
        "height": "ALTER TABLE user_profiles ADD COLUMN height INTEGER",
        "activity_level": "ALTER TABLE user_profiles ADD COLUMN activity_level VARCHAR",
        "fitness_level": "ALTER TABLE user_profiles ADD COLUMN fitness_level VARCHAR",
        "region": "ALTER TABLE user_profiles ADD COLUMN region VARCHAR",
        "target_weight": "ALTER TABLE user_profiles ADD COLUMN target_weight INTEGER",
        "workout_preference": "ALTER TABLE user_profiles ADD COLUMN workout_preference VARCHAR",
        "medical_notes": "ALTER TABLE user_profiles ADD COLUMN medical_notes TEXT",
        "memory_summary": "ALTER TABLE user_profiles ADD COLUMN memory_summary TEXT",
        "completed_workouts": "ALTER TABLE user_profiles ADD COLUMN completed_workouts INTEGER DEFAULT 0",
        "skipped_workouts": "ALTER TABLE user_profiles ADD COLUMN skipped_workouts INTEGER DEFAULT 0",
        "last_active_date": "ALTER TABLE user_profiles ADD COLUMN last_active_date VARCHAR",
    }
    chat_columns = {
        "timestamp": "ALTER TABLE chat_history ADD COLUMN timestamp VARCHAR",
    }
    history_columns = {
        "calories_intake": "ALTER TABLE user_history ADD COLUMN calories_intake INTEGER DEFAULT 0",
    }
    workout_columns = {
        "intensity": "ALTER TABLE workout_logs ADD COLUMN intensity INTEGER DEFAULT 0",
    }

    with engine.begin() as connection:
        profile_info = {
            row[1] for row in connection.exec_driver_sql("PRAGMA table_info(user_profiles)")
        }
        for column_name, statement in profile_columns.items():
            if column_name not in profile_info:
                connection.exec_driver_sql(statement)

        chat_info = {
            row[1] for row in connection.exec_driver_sql("PRAGMA table_info(chat_history)")
        }
        for column_name, statement in chat_columns.items():
            if column_name not in chat_info:
                connection.exec_driver_sql(statement)

        history_info = {
            row[1] for row in connection.exec_driver_sql("PRAGMA table_info(user_history)")
        }
        for column_name, statement in history_columns.items():
            if column_name not in history_info:
                connection.exec_driver_sql(statement)

        workout_info = {
            row[1] for row in connection.exec_driver_sql("PRAGMA table_info(workout_logs)")
        }
        for column_name, statement in workout_columns.items():
            if column_name not in workout_info:
                connection.exec_driver_sql(statement)


def build_default_name(email: str) -> str:
    return email.split("@")[0].replace(".", " ").replace("_", " ").title()


def get_profile_or_404(db: Session, user_id: int) -> UserProfile:
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please create your profile first.",
        )
    return profile


def sync_profile_defaults(profile: UserProfile, user, db: Session) -> UserProfile:
    changed = False
    default_name = build_default_name(user.email)

    if not profile.name:
        profile.name = default_name
        changed = True
    if not profile.email:
        profile.email = user.email
        changed = True
    if profile.height is None:
        profile.height = 170
        changed = True
    if not profile.activity_level:
        profile.activity_level = "moderate"
        changed = True
    if not profile.fitness_level:
        profile.fitness_level = "intermediate"
        changed = True
    if not profile.region:
        profile.region = "india"
        changed = True
    if profile.target_weight is None:
        profile.target_weight = profile.weight
        changed = True
    if not profile.workout_preference:
        profile.workout_preference = "Push / Pull / Legs"
        changed = True
    if not profile.memory_summary:
        profile.memory_summary = (
            f"User prefers {profile.workout_preference} and is focused on {profile.goal}."
        )
        changed = True
    if profile.completed_workouts is None:
        profile.completed_workouts = 0
        changed = True
    if profile.skipped_workouts is None:
        profile.skipped_workouts = 0
        changed = True

    if changed:
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


def sync_adherence_metrics(profile: UserProfile, workout_logs: list, db: Session | None = None) -> UserProfile:
    workout_days = sorted({log.date for log in workout_logs})
    if workout_days:
        profile.completed_workouts = len(workout_days)
        profile.last_active_date = workout_days[-1]
        last_active = _parse_date(workout_days[-1])
        if last_active:
            inactive_days = max((datetime.now(timezone.utc).date() - last_active.date()).days, 0)
            profile.skipped_workouts = max(profile.skipped_workouts or 0, max(inactive_days - 1, 0))

    if db is not None:
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


def create_history_snapshot(
    db: Session,
    *,
    user_id: int,
    weight: int,
    previous_goal: str,
    weekly_performance: int = 0,
    streak_days: int = 0,
    calories_intake: int = 0,
    log_date: str | None = None,
) -> UserHistory:
    history_entry = UserHistory(
        user_id=user_id,
        log_date=log_date or datetime.now(timezone.utc).date().isoformat(),
        weight=weight,
        previous_goal=previous_goal,
        weekly_performance=weekly_performance,
        streak_days=streak_days,
        calories_intake=calories_intake,
    )
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)
    return history_entry


def save_chat_entry(db: Session, *, user_id: int, user_input: str, ai_response: str) -> ChatHistory:
    chat_entry = ChatHistory(
        user_id=user_id,
        user_input=user_input,
        ai_response=ai_response,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
    db.add(chat_entry)
    db.commit()
    db.refresh(chat_entry)
    return chat_entry


def get_recent_chat_history(db: Session, user_id: int, limit: int = 10) -> list[ChatHistory]:
    history = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user_id)
        .order_by(ChatHistory.id.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(history))


def _parse_date(date_value: str | None):
    if not date_value:
        return None
    try:
        parsed = datetime.fromisoformat(date_value.replace("Z", "+00:00"))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except ValueError:
        try:
            parsed = datetime.fromisoformat(f"{date_value}T00:00:00+00:00")
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            return None
