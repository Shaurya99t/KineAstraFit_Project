"""
Workout analytics and adaptive planning utilities.
"""

from __future__ import annotations

from datetime import datetime, timezone


def _parse_date(date_value: str | None) -> datetime | None:
    if not date_value:
        return None
    try:
        parsed = datetime.fromisoformat(date_value.replace("Z", "+00:00"))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except ValueError:
        try:
            parsed = datetime.fromisoformat(f"{date_value}T00:00:00+00:00")
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            return None


def calculate_workout_intensity(sets: int, reps: int, weight: int) -> int:
    raw_score = (sets * reps * max(weight, 1)) / 25
    return max(10, min(round(raw_score), 100))


def calculate_fatigue(profile, workout_logs: list) -> int:
    recent_logs = workout_logs[-5:]
    recent_intensity = sum(getattr(log, "intensity", 0) for log in recent_logs)
    last_active = _parse_date(profile.last_active_date)
    days_inactive = 0
    if last_active:
        days_inactive = max((datetime.now(timezone.utc) - last_active).days, 0)

    fatigue = round((recent_intensity / 250) + (days_inactive * 8))
    if profile.skipped_workouts:
        fatigue += min(profile.skipped_workouts * 4, 18)
    return max(5, min(fatigue, 100))


def get_completion_rate(profile) -> int:
    total = (profile.completed_workouts or 0) + (profile.skipped_workouts or 0)
    if total == 0:
        return 0
    return round(((profile.completed_workouts or 0) / total) * 100)


def calculate_streak_days(workout_logs: list) -> int:
    if not workout_logs:
        return 0

    workout_days = sorted({log.date for log in workout_logs}, reverse=True)
    streak = 0
    expected_day = datetime.now(timezone.utc).date()

    for date_str in workout_days:
        parsed = _parse_date(date_str)
        if not parsed:
            continue
        current_day = parsed.date()
        if current_day == expected_day:
            streak += 1
            expected_day = expected_day.fromordinal(expected_day.toordinal() - 1)
        elif current_day == expected_day.fromordinal(expected_day.toordinal() - 1) and streak == 0:
            streak += 1
            expected_day = current_day.fromordinal(current_day.toordinal() - 1)
        else:
            break

    return streak


def generate_daily_plan(profile, history: list, fatigue: int) -> dict:
    completion_rate = get_completion_rate(profile)
    workout_preference = (profile.workout_preference or "").lower()
    goal = profile.goal.lower()
    recent_performance = 0
    if history:
        recent_entries = history[-4:]
        recent_performance = round(
            sum(item.weekly_performance for item in recent_entries) / len(recent_entries)
        )

    if fatigue >= 70:
        workout = "Recovery / Mobility"
        intensity = "low"
    elif (profile.skipped_workouts or 0) >= 2:
        workout = "Full Body Reset"
        intensity = "moderate-low"
    elif "home" in workout_preference:
        workout = "Home Strength"
        intensity = "moderate"
    elif completion_rate >= 75 or recent_performance >= 75:
        workout = "Push Day"
        intensity = "high"
    else:
        workout = "Pull Day"
        intensity = "moderate"

    calories = _daily_calories(profile, fatigue)
    steps = 11000 if "fat" in goal else 8500
    water = max(2.5, round(profile.weight * 0.035, 1))
    protein = round(profile.weight * (2.0 if "muscle" in goal else 1.8))

    if (profile.skipped_workouts or 0) >= 2:
        tip = "You missed 2 sessions. Let's reduce load and rebuild consistency."
    elif fatigue >= 70:
        tip = "Lower the load today and focus on movement quality."
    elif completion_rate >= 75 or recent_performance >= 75:
        tip = "You've been consistent. Increase intensity slightly and keep form sharp."
    else:
        tip = "Keep rest time short and prioritize the first two compound lifts."

    return {
        "workout_type": workout,
        "intensity": intensity,
        "calories_target": calories,
        "steps_goal": steps,
        "water_intake": water,
        "protein_target": protein,
        "tip": tip,
    }


def generate_weekly_plan(profile, fatigue: int) -> list[dict]:
    prefers_home = "home" in (profile.workout_preference or "").lower()
    goal = profile.goal.lower()

    base = [
        ("Mon", "Push", "Chest, shoulders, triceps"),
        ("Tue", "Pull", "Back, biceps, posture"),
        ("Wed", "Legs", "Quads, glutes, hamstrings"),
        ("Thu", "Recovery", "Mobility and light cardio"),
        ("Fri", "Upper", "Strength and compounds"),
        ("Sat", "Conditioning", "Steps, cardio, core"),
        ("Sun", "Recovery", "Stretching and walking"),
    ]

    weekly = []
    for day, workout, focus in base:
        work_name = workout
        if prefers_home and workout in {"Push", "Pull", "Upper"}:
            work_name = f"{workout} Home"
        if fatigue >= 70 and workout != "Recovery":
            work_name = "Deload Session"
        if "muscle" in goal and workout == "Conditioning":
            work_name = "Pull Hypertrophy"
        weekly.append({"day": day, "workout": work_name, "focus": focus})
    return weekly


def build_weight_progress(history: list) -> list[dict]:
    return [{"date": item.log_date[5:], "weight": item.weight} for item in history[-12:]]


def build_calories_progress(history: list) -> list[dict]:
    return [{"date": item.log_date[5:], "calories": item.calories_intake} for item in history[-12:]]


def build_weekly_consistency(workout_logs: list) -> list[dict]:
    weekly_map: dict[str, int] = {}
    for log in workout_logs:
        week = log.date[:7]
        weekly_map[week] = weekly_map.get(week, 0) + 1

    return [{"week": week, "sessions": count} for week, count in sorted(weekly_map.items())[-8:]]


def build_workout_volume_progress(workout_logs: list) -> list[dict]:
    return [
        {
            "date": log.date[5:],
            "exercise": log.exercise_name,
            "weight": log.weight,
            "volume": log.sets * log.reps * max(log.weight, 1),
        }
        for log in workout_logs[-20:]
    ]


def _daily_calories(profile, fatigue: int) -> int:
    base = round(profile.weight * 28 + profile.height * 3)
    if "fat" in profile.goal.lower():
        base -= 300
    elif "muscle" in profile.goal.lower():
        base += 250
    if fatigue >= 70:
        base -= 100
    return base
