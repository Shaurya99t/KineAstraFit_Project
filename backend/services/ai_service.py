"""
AI orchestration service for memory-aware and retrieval-aware coaching.
"""

from __future__ import annotations

import asyncio

from services.memory_service import build_memory_summary, format_recent_history
from services.nutrition_service import get_nutrition_plan
from services.rag_service import get_rag_service
from services.workout_service import (
    calculate_fatigue,
    calculate_streak_days,
    generate_daily_plan,
    get_completion_rate,
)


async def build_chat_context(profile, workout_logs, history, recent_chats, user_input: str) -> dict:
    rag_service = get_rag_service()
    rag_docs = await asyncio.to_thread(rag_service.retrieve, user_input, 3)
    rag_context = "\n".join(
        f"- [{doc.get('topic', 'fitness')}] {doc.get('content', '')}" for doc in rag_docs
    )
    fatigue = calculate_fatigue(profile, workout_logs)
    daily_plan = generate_daily_plan(profile, history, fatigue)
    nutrition = get_nutrition_plan(profile)
    memory_summary = build_memory_summary(profile, recent_chats)
    memory_text = format_recent_history(recent_chats, limit=5)
    completion_rate = get_completion_rate(profile)
    streak_days = calculate_streak_days(workout_logs)
    workout_summary = _build_workout_summary(workout_logs)

    return {
        "rag_context": rag_context,
        "fatigue": fatigue,
        "daily_plan": daily_plan,
        "nutrition": nutrition,
        "memory_summary": memory_summary,
        "memory_text": memory_text,
        "completion_rate": completion_rate,
        "streak_days": streak_days,
        "workout_summary": workout_summary,
    }


def build_chat_prompt(profile, context: dict, user_input: str) -> str:
    region = (profile.region or "india").lower()
    discipline_line = (
        "You missed 2 sessions. Let's reduce load and rebuild consistency."
        if (profile.skipped_workouts or 0) >= 2
        else context["daily_plan"]["tip"]
    )
    tone_rules = (
        "Use Indian examples like roti, dal, paneer, rice, sabzi, eggs, chicken curry. "
        "Keep the tone practical and slightly strict, like an Indian trainer. "
        "Using light words like bhai, focus kar, simple rakho, consistency rakho is allowed when natural."
        if region == "india"
        else "Use clean global coaching language with practical meal and workout examples."
    )

    return f"""
You are the Discipline AI Coach for a premium fitness app.

PROFILE
Name: {profile.name}
Weight: {profile.weight} kg
Goal: {profile.goal}
Diet: {profile.diet}
Activity Level: {profile.activity_level}
Region: {profile.region}
Fatigue Score: {context["fatigue"]}
Memory Summary: {context["memory_summary"]}

RECENT PERFORMANCE
Completed Workouts: {profile.completed_workouts or 0}
Skipped Workouts: {profile.skipped_workouts or 0}
Completion Rate: {context["completion_rate"]}%
Streak: {context["streak_days"]} days
Last Active Date: {profile.last_active_date or "N/A"}

RECENT CHATS
{context["memory_text"] or "No prior chats."}

RECENT WORKOUT LOGS
{context["workout_summary"]}

TODAY'S PLAN
Workout Type: {context["daily_plan"]["workout_type"]}
Calories Target: {context["daily_plan"]["calories_target"]} kcal
Protein Target: {context["daily_plan"]["protein_target"]}g

NUTRITION TARGETS
Calories: {context["nutrition"]["calories"]} kcal
Protein: {context["nutrition"]["protein"]}g
Carbs: {context["nutrition"]["carbs"]}g
Fats: {context["nutrition"]["fats"]}g

RAG KNOWLEDGE
{context["rag_context"]}

COACH RULES
- Only answer from the user profile and context above.
- Do not suggest unrelated activities.
- Keep the answer short and practical.
- Maximum 5 lines.
- Format exactly like:
Today plan:
• ...
• ...
• ...
• ...
- Mention the workout type from today's plan unless the user's question clearly asks to change it.
- Keep the tip human and direct, not robotic.
- Use bullet points only after the first line.
- Include workout, calories, protein, and one direct focus item.
- If useful, include one diet example matched to the user's region and diet.
- {tone_rules}
- If user skipped workouts, use this discipline principle:
{discipline_line}

USER QUESTION
{user_input}
"""


def _build_workout_summary(workout_logs: list) -> str:
    if not workout_logs:
        return "No logged workouts yet."

    recent_logs = workout_logs[-5:]
    return "\n".join(
        f"- {log.date}: {log.exercise_name} {log.sets}x{log.reps} @ {log.weight} kg"
        for log in recent_logs
    )
