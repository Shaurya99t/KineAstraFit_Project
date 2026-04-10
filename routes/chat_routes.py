"""
Chat and memory route handlers.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from groq_client import get_ai_response
from models import ChatHistory, User, UserHistory, UserProfile, WorkoutLog
from schemas import ChatHistoryCreate, ChatHistoryResponse, ChatRequest, ChatResponse
from services.ai_service import build_chat_context, build_chat_prompt
from services.profile_service import (
    get_profile_or_404,
    get_recent_chat_history,
    save_chat_entry,
    sync_adherence_metrics,
    sync_profile_defaults,
)

router = APIRouter(tags=["AI Chat", "Memory"])


@router.post("/chat-history", response_model=ChatHistoryResponse)
async def create_chat_history(
    payload: ChatHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return save_chat_entry(
        db,
        user_id=current_user.id,
        user_input=payload.user_input,
        ai_response=payload.ai_response,
    )


@router.get("/chat-history", response_model=list[ChatHistoryResponse])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_recent_chat_history(db, current_user.id, limit=10)


@router.delete("/chat-history")
async def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).delete()
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if profile:
        profile.memory_summary = (
            f"User prefers {profile.workout_preference or 'structured training'} "
            f"and is focused on {profile.goal}."
        )
        db.add(profile)
    db.commit()
    return {"detail": "Chat history cleared."}


@router.post("/chat", response_model=ChatResponse)
async def chat(
    chat_data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = sync_profile_defaults(get_profile_or_404(db, current_user.id), current_user, db)
    workout_logs = (
        db.query(WorkoutLog)
        .filter(WorkoutLog.user_id == current_user.id)
        .order_by(WorkoutLog.date.asc(), WorkoutLog.id.asc())
        .all()
    )[-30:]
    sync_adherence_metrics(profile, workout_logs, db)

    history = (
        db.query(UserHistory)
        .filter(UserHistory.user_id == current_user.id)
        .order_by(UserHistory.log_date.asc(), UserHistory.id.asc())
        .all()
    )
    recent_chats = get_recent_chat_history(db, current_user.id, limit=5)
    context = await build_chat_context(profile, workout_logs, history, recent_chats, chat_data.user_input)

    profile.memory_summary = context["memory_summary"]
    db.add(profile)
    db.commit()
    db.refresh(profile)

    prompt = build_chat_prompt(profile, context, chat_data.user_input)

    try:
        ai_response = await get_ai_response(prompt)
        save_chat_entry(
            db,
            user_id=current_user.id,
            user_input=chat_data.user_input,
            ai_response=ai_response,
        )
        return ChatResponse(response=ai_response)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
