import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Search,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { getNutritionPlan, getProfile, searchNutrition } from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

const MEAL_KEYS = ["breakfast", "lunch", "dinner"];

const FOOD_CHIPS = {
  india: ["Paneer", "Roti", "Dal", "Chicken curry", "Dosa", "Poha"],
  global: ["Chicken breast", "Rice", "Greek yogurt", "Oats", "Salmon", "Tofu"],
};

function getStorageKey(userId) {
  return `kine-meal-log-${userId}`;
}

export default function NutritionPage() {
  const [profile, setProfile] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [mealLog, setMealLog] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [mode, setMode] = useState("india");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNutrition() {
      try {
        const [profileResponse, nutritionResponse] = await Promise.all([
          getProfile(),
          getNutritionPlan(),
        ]);

        setProfile(profileResponse.data);
        setNutrition(nutritionResponse.data);
        setMode(profileResponse.data.region === "global" ? "global" : "india");

        const saved = localStorage.getItem(getStorageKey(profileResponse.data.user_id));
        if (saved) {
          setMealLog(JSON.parse(saved));
        }
      } catch (err) {
        setError(getErrorMessage(err) || "Unable to load nutrition.");
      } finally {
        setLoading(false);
      }
    }

    loadNutrition();
  }, []);

  useEffect(() => {
    if (!profile) {
      return;
    }

    localStorage.setItem(getStorageKey(profile.user_id), JSON.stringify(mealLog));
  }, [mealLog, profile]);

  const totals = useMemo(() => {
    const allItems = Object.values(mealLog).flat();
    return allItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fats: acc.fats + item.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [mealLog]);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }

    setSearching(true);
    setError("");
    try {
      const response = await searchNutrition(query.trim());
      setResult(response.data);
    } catch (err) {
      setError(getErrorMessage(err) || "Unable to search food.");
    } finally {
      setSearching(false);
    }
  };

  const addToMeal = (meal) => {
    if (!result) {
      return;
    }

    setMealLog((current) => ({
      ...current,
      [meal]: [...current[meal], result],
    }));
  };

  const removeFromMeal = (meal, index) => {
    setMealLog((current) => ({
      ...current,
      [meal]: current[meal].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  if (loading) {
    return (
      <div className="glass-card rounded-[30px] p-8 text-center text-muted">
        Loading nutrition system...
      </div>
    );
  }

  if (error && !nutrition) {
    return <div className="glass-card rounded-[30px] p-8 text-rose-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden rounded-[32px]"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-8">
            <p className="section-label">Nutrition</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Food system for your goal
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              Search food, add it to meals, and keep calories simple. No clutter. Just useful tracking.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Calories</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {totals.calories}/{nutrition.calories}
                </p>
              </div>
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Protein</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {totals.protein}/{nutrition.protein}g
                </p>
              </div>
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Carbs</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {totals.carbs}/{nutrition.carbs}g
                </p>
              </div>
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Fats</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {totals.fats}/{nutrition.fats}g
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { key: "india", label: "Indian meals" },
                { key: "global", label: "International meals" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setMode(option.key)}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                    mode === option.key
                      ? "bg-slate-950 text-white dark:bg-cyan-500 dark:text-slate-950"
                      : "border border-slate-200/80 bg-white text-slate-700 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-[260px] overflow-hidden">
            <img
              src={
                mode === "india"
                  ? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                  : "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80"
              }
              alt="Nutrition"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <p className="section-label text-slate-300">Meal direction</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-200">
                {mode === "india"
                  ? "Paneer, roti, dal, rice, tiffin-friendly choices. Simple, realistic, repeatable."
                  : "Lean protein, carbs that support training, and meals you can stick with every day."}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-card rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-label">Search Food</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                Search and add fast
              </h3>
            </div>
            <Sparkles size={18} className="text-cyan-500" />
          </div>

          <form onSubmit={handleSearch} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  mode === "india"
                    ? "Search food (e.g. paneer, roti, chicken curry)"
                    : "Search food (e.g. rice, salmon, oats)"
                }
                className="kine-input pl-11"
              />
            </div>
            <button type="submit" disabled={searching} className="kine-button-primary">
              {searching ? "Searching..." : "Search"}
            </button>
          </form>

          {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {FOOD_CHIPS[mode].map((food) => (
              <button
                key={food}
                onClick={() => setQuery(food)}
                className="shrink-0 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {food}
              </button>
            ))}
          </div>

          {result ? (
            <div className="mt-5 soft-panel p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-ink">{result.name}</p>
                  <p className="text-sm text-muted">{result.serving}</p>
                </div>
                <span className="metric-chip">{result.calories} kcal</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[20px] bg-slate-50 px-3 py-3 text-sm dark:bg-slate-950/70">
                  <p className="text-muted">Protein</p>
                  <p className="mt-1 font-semibold text-ink">{result.protein}g</p>
                </div>
                <div className="rounded-[20px] bg-slate-50 px-3 py-3 text-sm dark:bg-slate-950/70">
                  <p className="text-muted">Carbs</p>
                  <p className="mt-1 font-semibold text-ink">{result.carbs}g</p>
                </div>
                <div className="rounded-[20px] bg-slate-50 px-3 py-3 text-sm dark:bg-slate-950/70">
                  <p className="text-muted">Fats</p>
                  <p className="mt-1 font-semibold text-ink">{result.fats}g</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {MEAL_KEYS.map((meal) => (
                  <button key={meal} onClick={() => addToMeal(meal)} className="kine-button-secondary">
                    Add to {meal}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="glass-card rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Meal Builder</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                Breakfast, lunch, dinner
              </h3>
            </div>
            <div className="metric-chip inline-flex items-center gap-2">
              <Flame size={14} />
              {totals.calories} kcal logged
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {MEAL_KEYS.map((meal) => (
              <div key={meal} className="soft-panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold capitalize text-ink">{meal}</p>
                  <UtensilsCrossed size={16} className="text-cyan-500" />
                </div>

                <div className="mt-4 space-y-2">
                  {mealLog[meal].length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-slate-200/80 px-3 py-4 text-sm text-muted dark:border-slate-700/80">
                      Add items from search.
                    </div>
                  ) : (
                    mealLog[meal].map((item, index) => (
                      <div
                        key={`${meal}-${item.name}-${index}`}
                        className="rounded-[18px] border border-slate-200/70 bg-white/80 px-3 py-3 dark:border-slate-800/80 dark:bg-slate-900/70"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-ink">{item.name}</p>
                            <p className="mt-1 text-xs text-muted">
                              {item.calories} kcal | {item.protein}p | {item.carbs}c | {item.fats}f
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromMeal(meal, index)}
                            className="text-xs text-rose-500 transition hover:text-rose-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="soft-panel p-4">
              <p className="text-sm text-muted">Suggested daily meals</p>
              <div className="mt-3 space-y-2">
                {nutrition.meals.map((meal) => (
                  <div
                    key={meal}
                    className="rounded-[18px] border border-slate-200/70 bg-white/80 px-3 py-3 text-sm text-ink dark:border-slate-800/80 dark:bg-slate-900/70"
                  >
                    {meal}
                  </div>
                ))}
              </div>
            </div>

            <div className="soft-panel p-4">
              <p className="text-sm text-muted">Macro summary</p>
              <div className="mt-3 space-y-3">
                {[
                  {
                    label: "Calories",
                    value: `${totals.calories}/${nutrition.calories}`,
                    tone: "from-orange-400 to-red-500",
                    progress: Math.min(Math.round((totals.calories / nutrition.calories) * 100), 100),
                  },
                  {
                    label: "Protein",
                    value: `${totals.protein}/${nutrition.protein}g`,
                    tone: "from-cyan-500 to-sky-500",
                    progress: Math.min(Math.round((totals.protein / nutrition.protein) * 100), 100),
                  },
                  {
                    label: "Carbs",
                    value: `${totals.carbs}/${nutrition.carbs}g`,
                    tone: "from-emerald-400 to-teal-500",
                    progress: Math.min(Math.round((totals.carbs / Math.max(nutrition.carbs, 1)) * 100), 100),
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">{item.label}</span>
                      <span className="font-medium text-ink">{item.value}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200/80 dark:bg-slate-900">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.tone}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
