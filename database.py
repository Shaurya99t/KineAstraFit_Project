"""
Database connection and session management for PostgreSQL.
Uses SQLAlchemy for ORM with async support.
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Database URL from environment variables
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fitness_app.db")

# Create database engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create session factory - each session represents a DB transaction
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all SQLAlchemy models
# All models will inherit from this
Base = declarative_base()


def get_db():
    """
    Dependency function to get a database session.
    Yields a session and ensures it's closed after use.
    This is used by FastAPI's dependency injection system.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
