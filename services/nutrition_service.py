"""
Nutrition calculation utilities.
"""

from __future__ import annotations

FOOD_LIBRARY = [
    {"name": "chicken breast", "serving": "100 g", "calories": 165, "protein": 31, "carbs": 0, "fats": 4},
    {"name": "rice", "serving": "100 g cooked", "calories": 130, "protein": 3, "carbs": 28, "fats": 0},
    {"name": "paneer", "serving": "100 g", "calories": 265, "protein": 18, "carbs": 6, "fats": 20},
    {"name": "tofu", "serving": "100 g", "calories": 144, "protein": 15, "carbs": 3, "fats": 9},
    {"name": "oats", "serving": "50 g", "calories": 190, "protein": 7, "carbs": 32, "fats": 3},
    {"name": "eggs", "serving": "2 whole eggs", "calories": 156, "protein": 13, "carbs": 1, "fats": 11},
    {"name": "greek yogurt", "serving": "170 g", "calories": 100, "protein": 17, "carbs": 6, "fats": 0},
    {"name": "banana", "serving": "1 medium", "calories": 105, "protein": 1, "carbs": 27, "fats": 0},
    {"name": "salmon", "serving": "100 g", "calories": 208, "protein": 20, "carbs": 0, "fats": 13},
    {"name": "lentils", "serving": "100 g cooked", "calories": 116, "protein": 9, "carbs": 20, "fats": 0},
    {"name": "roti", "serving": "1 medium", "calories": 120, "protein": 3, "carbs": 18, "fats": 3},
    {"name": "dal", "serving": "1 katori", "calories": 140, "protein": 8, "carbs": 18, "fats": 4},
    {"name": "sabzi", "serving": "1 bowl", "calories": 110, "protein": 3, "carbs": 12, "fats": 5},
    {"name": "chicken curry", "serving": "1 bowl", "calories": 240, "protein": 24, "carbs": 6, "fats": 13},
    {"name": "dosa", "serving": "1 plain dosa", "calories": 168, "protein": 4, "carbs": 28, "fats": 4},
    {"name": "idli", "serving": "2 idli", "calories": 116, "protein": 4, "carbs": 24, "fats": 1},
    {"name": "poha", "serving": "1 bowl", "calories": 210, "protein": 4, "carbs": 34, "fats": 6},
    {"name": "chai", "serving": "1 cup", "calories": 90, "protein": 2, "carbs": 10, "fats": 4},
]


ACTIVITY_MULTIPLIERS = {
    "low": 1.2,
    "moderate": 1.5,
    "high": 1.7,
    "athlete": 1.9,
}


def calculate_bmr(profile) -> int:
    return round((10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5)


def calculate_tdee(profile) -> int:
    multiplier = ACTIVITY_MULTIPLIERS.get(profile.activity_level.lower(), 1.5)
    return round(calculate_bmr(profile) * multiplier)


def build_meal_plan(profile, calories: int) -> list[str]:
    diet = profile.diet.lower()
    goal = profile.goal.lower()
    region = (profile.region or "india").lower()

    if region == "india":
        if "veg" in diet and "non" not in diet:
            meals = [
                "Breakfast: Oats or poha + curd",
                "Lunch: Roti + dal + paneer + sabzi",
                "Snack: Chai + roasted chana or fruit",
                "Dinner: Rice + dal + paneer bhurji",
            ]
        else:
            meals = [
                "Breakfast: Eggs + toast or oats",
                "Lunch: Roti + chicken curry + sabzi",
                "Snack: Chai + boiled eggs or fruit",
                "Dinner: Rice + chicken + dal",
            ]
    else:
        if "veg" in diet and "non" not in diet:
            meals = [
                "Breakfast: Oats + Greek yogurt + berries",
                "Lunch: Paneer rice bowl + vegetables",
                "Snack: Protein smoothie + banana",
                "Dinner: Tofu + lentils + salad",
            ]
        else:
            meals = [
                "Breakfast: Oats + eggs + fruit",
                "Lunch: Chicken + rice + vegetables",
                "Snack: Yogurt + nuts",
                "Dinner: Fish + potatoes + salad",
            ]

    if "fat" in goal:
        meals[-1] = meals[-1] + f" ({calories} kcal deficit target)"
    elif "muscle" in goal:
        meals[-1] = meals[-1] + f" ({calories} kcal surplus target)"

    return meals


def get_nutrition_plan(profile) -> dict:
    bmr = calculate_bmr(profile)
    tdee = calculate_tdee(profile)
    goal = profile.goal.lower()

    if "fat" in goal:
        calories = tdee - 350
    elif "muscle" in goal:
        calories = tdee + 250
    else:
        calories = tdee

    protein = round(profile.weight * (2.0 if "muscle" in goal else 1.8))
    fats = round(profile.weight * 0.8)
    carbs = round((calories - (protein * 4 + fats * 9)) / 4)

    return {
        "bmr": bmr,
        "tdee": tdee,
        "calories": calories,
        "protein": protein,
        "carbs": max(carbs, 0),
        "fats": fats,
        "meals": build_meal_plan(profile, calories),
    }


def search_food(query: str) -> dict:
    normalized_query = query.strip().lower()
    for item in FOOD_LIBRARY:
        if normalized_query in item["name"]:
            return item

    query_terms = set(normalized_query.split())
    best_match = FOOD_LIBRARY[0]
    best_score = -1

    for item in FOOD_LIBRARY:
        name_terms = set(item["name"].split())
        score = len(query_terms.intersection(name_terms))
        if score > best_score:
            best_match = item
            best_score = score

    return best_match
