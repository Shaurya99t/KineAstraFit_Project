from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class ChatRequest(BaseModel):
    user_input: str


class ChatResponse(BaseModel):
    response: str


class ChatHistoryCreate(BaseModel):
    user_input: str
    ai_response: str


class ChatHistoryResponse(BaseModel):
    id: int
    user_id: int
    user_input: str
    ai_response: str

    class Config:
        orm_mode = True
