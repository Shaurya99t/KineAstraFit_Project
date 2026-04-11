"""
Utilities for formatting conversation memory and building lightweight summaries.
"""

from __future__ import annotations

from collections import Counter


def format_recent_history(history_items: list, limit: int = 5) -> str:
    selected = history_items[-limit:] if len(history_items) > limit else history_items
    return "\n".join(
        f"User: {item.user_input}\nAI: {item.ai_response}" for item in selected
    )


def build_memory_summary(profile, history_items: list) -> str:
    if not history_items:
        return (
            f"User prefers {profile.workout_preference or 'structured training'} "
            f"and is focused on {profile.goal}."
        )

    combined = " ".join(
        f"{item.user_input} {item.ai_response}" for item in history_items[-10:]
    ).lower()

    habit_notes: list[str] = []

    if "home" in combined:
        habit_notes.append("prefers home workouts")
    if "busy" in combined or "schedule" in combined:
        habit_notes.append("needs plans that fit a busy schedule")
    if "consistency" in combined or "consistent" in combined:
        habit_notes.append("is focused on improving consistency")
    if "protein" in combined or "meal" in combined or "diet" in combined:
        habit_notes.append("cares about nutrition structure")
    if "knee" in combined or "back pain" in combined or "injury" in combined:
        habit_notes.append("mentions movement limitations")

    if not habit_notes:
        habit_notes.append("responds best to practical structured plans")

    most_common = [item for item, _ in Counter(habit_notes).most_common(3)]
    habits = ", ".join(most_common)

    return (
        f"User is currently focused on {profile.goal}, follows a {profile.diet} diet, "
        f"and {habits}."
    )
