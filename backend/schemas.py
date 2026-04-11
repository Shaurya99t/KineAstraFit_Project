"""
Pydantic schemas for request and response validation.
"""

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: EmailStr | None = None
    name: str | None = None


class ProfileBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    age: int = Field(..., ge=1, le=120)
    weight: int = Field(..., ge=1, le=500)
    height: int = Field(..., ge=50, le=250)
    goal: str = Field(..., min_length=2, max_length=100)
    diet: str = Field(..., min_length=2, max_length=100)
    activity_level: str = Field(..., min_length=2, max_length=100)
    fitness_level: str = Field(..., min_length=2, max_length=100)
    region: str = Field(..., min_length=2, max_length=20)
    target_weight: int = Field(..., ge=1, le=500)
    workout_preference: str = Field(..., min_length=2, max_length=100)
    medical_notes: str | None = Field(default=None, max_length=500)


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    memory_summary: str | None = None
    completed_workouts: int = 0
    skipped_workouts: int = 0
    last_active_date: str | None = None

    class Config:
        from_attributes = True


class HistoryCreate(BaseModel):
    log_date: str
    weight: int = Field(..., ge=1, le=500)
    previous_goal: str
    weekly_performance: int = Field(..., ge=0, le=100)
    streak_days: int = Field(..., ge=0, le=3650)
    calories_intake: int = Field(..., ge=0, le=10000)


class HistoryResponse(HistoryCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class WorkoutLogCreate(BaseModel):
    exercise_name: str = Field(..., min_length=2, max_length=120)
    sets: int = Field(..., ge=1, le=20)
    reps: int = Field(..., ge=1, le=100)
    weight: int = Field(..., ge=0, le=1000)
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
    weekly_plan: list[dict]
    weight_progress: list[dict]
    weekly_consistency: list[dict]
    calories_progress: list[dict]


class NutritionPlanResponse(BaseModel):
    bmr: int
    tdee: int
    calories: int
    protein: int
    carbs: int
    fats: int
    meals: list[str]


class NutritionSearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=100)


class NutritionSearchResponse(BaseModel):
    name: str
    serving: str
    calories: int
    protein: int
    carbs: int
    fats: int


class NutritionLogCreate(BaseModel):
    food: str = Field(..., min_length=1, max_length=200)
    calories: int = Field(..., ge=0)
    protein: int = Field(..., ge=0)
    carbs: int = Field(..., ge=0)
    fats: int = Field(..., ge=0)
    date: str


class NutritionLogResponse(NutritionLogCreate):
    id: int
    user_id: int


class ChatHistoryCreate(BaseModel):
    user_input: str = Field(..., min_length=1)
    ai_response: str = Field(..., min_length=1)


class ChatHistoryResponse(ChatHistoryCreate):
    id: int
    user_id: int
    timestamp: str | None = None

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    user_input: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    response: str
