from sqlalchemy import Column, Integer, String, Text
from database import Base


# ✅ USER TABLE (THIS WAS MISSING → CRASH FIX)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)


# ✅ PROFILE TABLE
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    name = Column(String)
    email = Column(String)
    weight = Column(Integer)
    height = Column(Integer)
    goal = Column(String)
    activity_level = Column(String)
    fitness_level = Column(String)
    region = Column(String)
    target_weight = Column(Integer)
    workout_preference = Column(String)
    medical_notes = Column(Text)
    memory_summary = Column(Text)
    completed_workouts = Column(Integer, default=0)
    skipped_workouts = Column(Integer, default=0)
    last_active_date = Column(String)


# ✅ HISTORY TABLE
class UserHistory(Base):
    __tablename__ = "user_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    log_date = Column(String)
    weight = Column(Integer)
    previous_goal = Column(String)
    weekly_performance = Column(Integer)
    streak_days = Column(Integer)
    calories_intake = Column(Integer)


# ✅ CHAT TABLE
class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    user_input = Column(Text)
    ai_response = Column(Text)
    timestamp = Column(String)
