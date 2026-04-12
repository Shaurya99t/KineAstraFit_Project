from sqlalchemy import Column, Float, Integer, String, Text
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    goal = Column(String, default="fat loss")
    diet = Column(String, default="veg")
    activity_level = Column(String, default="moderate")
    fitness_level = Column(String, default="beginner")
    region = Column(String, default="india")
    age = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    target_weight = Column(Float, nullable=True)
    workout_preference = Column(String, default="Push / Pull / Legs")
    medical_notes = Column(Text, nullable=True)
    memory_summary = Column(Text, nullable=True)


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    user_input = Column(Text)
    ai_response = Column(Text)
