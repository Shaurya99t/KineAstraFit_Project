"""
SQLAlchemy ORM models for the AI fitness platform.
"""

from sqlalchemy import Column, ForeignKey, Integer, String, Text

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    age = Column(Integer, nullable=False)
    weight = Column(Integer, nullable=False)
    height = Column(Integer, nullable=True)
    goal = Column(String, nullable=False)
    diet = Column(String, nullable=False)
    activity_level = Column(String, nullable=True)
    fitness_level = Column(String, nullable=True)
    region = Column(String, nullable=True)
    target_weight = Column(Integer, nullable=True)
    workout_preference = Column(String, nullable=True)
    medical_notes = Column(Text, nullable=True)
    memory_summary = Column(Text, nullable=True)
    completed_workouts = Column(Integer, nullable=True, default=0)
    skipped_workouts = Column(Integer, nullable=True, default=0)
    last_active_date = Column(String, nullable=True)

    def __repr__(self):
        return (
            f"<UserProfile(id={self.id}, user_id={self.user_id}, "
            f"name='{self.name}', goal='{self.goal}')>"
        )


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    user_input = Column(String, nullable=False)
    ai_response = Column(String, nullable=False)
    timestamp = Column(String, nullable=True)

    def __repr__(self):
        preview = self.user_input[:30] if self.user_input else ""
        return (
            f"<ChatHistory(id={self.id}, user_id={self.user_id}, "
            f"user_input='{preview}...')>"
        )


class UserHistory(Base):
    __tablename__ = "user_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=False)
    log_date = Column(String, nullable=False)
    weight = Column(Integer, nullable=False)
    previous_goal = Column(String, nullable=False)
    weekly_performance = Column(Integer, nullable=False, default=0)
    streak_days = Column(Integer, nullable=False, default=0)
    calories_intake = Column(Integer, nullable=False, default=0)

    def __repr__(self):
        return (
            f"<UserHistory(id={self.id}, user_id={self.user_id}, "
            f"log_date='{self.log_date}', weekly_performance={self.weekly_performance})>"
        )


class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=False)
    exercise_name = Column(String, nullable=False)
    sets = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=False)
    weight = Column(Integer, nullable=False)
    date = Column(String, nullable=False)
    intensity = Column(Integer, nullable=False, default=0)

    def __repr__(self):
        return (
            f"<WorkoutLog(id={self.id}, user_id={self.user_id}, "
            f"exercise='{self.exercise_name}', date='{self.date}')>"
        )


class NutritionLog(Base):
    __tablename__ = "nutrition_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=False)
    food = Column(String, nullable=False)
    calories = Column(Integer, nullable=False)
    protein = Column(Integer, nullable=False)
    carbs = Column(Integer, nullable=False)
    fats = Column(Integer, nullable=False)
    date = Column(String, nullable=False)

    def __repr__(self):
        return (
            f"<NutritionLog(id={self.id}, user_id={self.user_id}, "
            f"food='{self.food}', calories={self.calories})>"
        )


__all__ = [
    "User",
    "UserProfile",
    "ChatHistory",
    "UserHistory",
    "WorkoutLog",
    "NutritionLog",
]
