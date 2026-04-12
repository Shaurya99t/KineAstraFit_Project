from sqlalchemy import Column, Integer, String, Text
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, unique=True)

    name = Column(String)
    email = Column(String)

    age = Column(Integer)
    weight = Column(Integer)
    height = Column(Integer)

    goal = Column(String)
    diet = Column(String)

    activity_level = Column(String)
    fitness_level = Column(String)

    region = Column(String)
    target_weight = Column(Integer)

    workout_preference = Column(String)
    medical_notes = Column(Text)


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    user_input = Column(Text)
    ai_response = Column(Text)
