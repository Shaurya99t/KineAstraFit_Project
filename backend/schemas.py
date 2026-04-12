"""
Pydantic schemas for request and response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional


class UserCreate(BaseModel):
    email: str
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class ProfileBase(BaseModel):
    name: str
    email: str
    age: int
    weight: int
    height: int
    goal: str
    diet: str
    activity_level: str
    fitness_level: str
    region: str
    target_weight: int
    workout_preference: str
    medical_notes: Optional[str] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    memory_summary: Optional[str] = None
    completed_workouts: int = 0
    skipped_workouts: int = 0
    last_active_date: Optional[str] = None

    class Config:
        from_attributes = True


class HistoryCreate(BaseModel):
    log_date: str
    weight: int
    previous_goal: str
    weekly_performance: int
    streak_days: int
    calories_intake: int


class HistoryResponse(HistoryCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class WorkoutLogCreate(BaseModel):
    exercise_name: str
    sets: int
    reps: int
    weight: int
    date: str


class WorkoutLogResponse(WorkoutLogCreate):
    id: int
    user_id: int
    intensity: int

    class Config:
        from_attributes = True


class WorkoutProgressResponse(BaseModel):
    fatigue: int
    completion_rate: int
    streak_days: int
    completed_workouts: int
    skipped_workouts: int
    daily_plan: dict
    weekly_plan: list
    weight_progress: list
    weekly_consistency: list
    calories_progress: list


class NutritionPlanResponse(BaseModel):
    bmr: int
    tdee: int
    calories: int
    protein: int
    carbs: int
    fats: int
    meals: list


class NutritionSearchRequest(BaseModel):
    query: str


class NutritionSearchResponse(BaseModel):
    name: str
    serving: str
    calories: int
    protein: int
    carbs: int
    fats: int


class NutritionLogCreate(BaseModel):
    food: str
    calories: int
    protein: int
    carbs: int
    fats: int
    date: str


class NutritionLogResponse(NutritionLogCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class ChatHistoryCreate(BaseModel):
    user_input: str
    ai_response: str


class ChatHistoryResponse(ChatHistoryCreate):
    id: int
    user_id: int
    timestamp: Optional[str] = None

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    user_input: str


class ChatResponse(BaseModel):
    response: str
