import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Flame,
  Footprints,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  clearStoredToken,
  createHistoryEntry,
  decodeToken,
  getHistory,
  getNutritionPlan,
  getProfile,
  getWorkoutLogs,
  getWorkoutProgress,
} from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

function getWeekStart(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

const statusLines = {
  india: [
    "Aaj ka plan simple rakho. Bas execution pe focus karo.",
    "Bhai, overthink mat karo. Workout + steps + protein, bas.",
    "Consistency rakho. Small wins hi shape banate hain.",
  ],
  global: [
    "Keep it clean today. Execution matters more than perfection.",
    "Stay consistent today. Training, steps, and protein come first.",
    "Simple plan, sharp focus, better progress.",
  ],
};

const quickActions = [
  { label: "Start Workout", to: "/workouts" },
  { label: "Log Meal", to: "/nutrition" },
  { label: "Ask AI Coach", to: "/chat" },
  { label: "View Progress", to: "/profile" },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [completion, setCompletion] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          profileResponse,
          historyResponse,
          progressResponse,
          nutritionResponse,
          logsResponse,
        ] = await Promise.all([
          getProfile(),
          getHistory(),
          getWorkoutProgress(),
          getNutritionPlan(),
          getWorkoutLogs(),
        ]);

        setProfile(profileResponse.data);
        setHistory(historyResponse.data);
        setProgress(progressResponse.data);
        setNutrition(nutritionResponse.data);
        setLogs(logsResponse.data);
      } catch (err) {
        if (err.response?.status === 404) {
          navigate("/profile", { replace: true });
          return;
        }
        if (err.response?.status === 401) {
          clearStoredToken();
          navigate("/", { replace: true });
          return;
        }
        setError(getErrorMessage(err) || "We could not load the dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  const weekKey = useMemo(() => getWeekStart(), []);

  useEffect(() => {
    if (!profile || !progress) {
      return;
    }

    const stored = JSON.parse(
      localStorage.getItem(`kine-dashboard-${profile.user_id}-${weekKey}`) || "{}"
    );
    setCompletion(stored);
  }, [profile, progress, weekKey]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    localStorage.setItem(
      `kine-dashboard-${profile.user_id}-${weekKey}`,
      JSON.stringify(completion)
    );
  }, [completion, profile, weekKey]);

  const displayName =
    profile?.name || decodeToken()?.name || profile?.email?.split("@")[0] || "Athlete";

  const coachTone = profile?.region === "global" ? statusLines.global : statusLines.india;
  const heroLine = coachTone[new Date().getDate() % coachTone.length];

  const todayPlanItems = useMemo(() => {
    if (!progress || !nutrition) {
      return [];
    }

    return [
      {
        id: "workout",
        title: progress.daily_plan.workout_type,
        subtitle: `${progress.daily_plan.intensity} effort | ${progress.daily_plan.tip}`,
        metric: "Workout",
        progress: completion.workout ? 100 : 0,
      },
      {
        id: "nutrition",
        title: `${nutrition.calories} kcal | ${nutrition.protein}g protein`,
        subtitle: profile?.region === "india" ? "Ghar ka khana rakho, protein miss mat karo." : "Keep meals simple and protein first.",
        metric: "Nutrition",
        progress: completion.nutrition ? 100 : 0,
      },
      {
        id: "steps",
        title: `${Number(progress.daily_plan.steps_goal).toLocaleString()} steps`,
        subtitle: "Short walks after meals bhi count hoti hain.",
        metric: "Steps",
        progress: completion.steps ? 100 : 0,
      },
      {
        id: "water",
        title: `${progress.daily_plan.water_intake}L water`,
        subtitle: "Bottle paas rakho. Hydration easy ho jayega.",
        metric: "Water",
        progress: completion.water ? 100 : 0,
      },
    ];
  }, [completion, nutrition, profile?.region, progress]);

  const completionRate = todayPlanItems.length
    ? Math.round(
        (todayPlanItems.filter((item) => item.progress === 100).length / todayPlanItems.length) *
          100
      )
    : 0;

  const weeklyMiniData = (progress?.weekly_consistency || []).slice(-6);
  const recentHistory = history.slice(-7);
  const recentCalories = (progress?.calories_progress || []).slice(-7);
  const recentLogs = logs.slice(0, 5);

  const handleToggle = (id) => {
    setCompletion((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const handleSaveDay = async () => {
    if (!profile || !progress || !nutrition) {
      return;
    }

    setSyncing(true);
    setSyncMessage("");
    try {
      await createHistoryEntry({
        log_date: new Date().toISOString().slice(0, 10),
        weight: Number(profile.weight),
        previous_goal: profile.goal,
        weekly_performance: progress.completion_rate,
        streak_days: progress.streak_days,
        calories_intake: nutrition.calories,
      });
      setSyncMessage("Today synced.");
    } catch (err) {
      setSyncMessage(getErrorMessage(err) || "Unable to sync today.");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-[30px] p-8 text-center text-muted">
        Loading KineAstraFit dashboard...
      </div>
    );
  }

  if (error) {
    return <div className="glass-card rounded-[30px] p-8 text-rose-500">{error}</div>;
  }

  if (!profile || !progress || !nutrition) {
    return null;
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden rounded-[32px]"
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 sm:p-8">
            <p className="section-label">Today</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Hey {displayName}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              {heroLine}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Calories target</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {nutrition.calories}
                </p>
              </div>
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Workout type</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {progress.daily_plan.workout_type}
                </p>
              </div>
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Progress</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {completionRate}%
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Today completion</span>
                <span className="font-medium text-ink">{completionRate}%</span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-slate-200/80 dark:bg-slate-900">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-orange-400"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.to} className="kine-button-secondary">
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative min-h-[260px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80"
              alt="KineAstraFit training"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="section-label text-slate-300">Consistency</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-4xl font-semibold">{progress.streak_days} day streak</p>
                  <p className="mt-2 text-sm text-slate-200">
                    {progress.skipped_workouts >= 2
                      ? "Missed a couple of sessions. Aaj momentum wapas lao."
                      : "Steady kaam chal raha hai. Form aur routine dono tight rakho."}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Fatigue</p>
                  <p className="mt-1 text-2xl font-semibold">{progress.fatigue}/100</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Today Plan</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                What matters today
              </h3>
            </div>
            <button className="kine-button-secondary" onClick={handleSaveDay} disabled={syncing}>
              {syncing ? "Saving..." : "Save day"}
            </button>
          </div>
          {syncMessage ? <p className="mt-3 text-sm text-muted">{syncMessage}</p> : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {todayPlanItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className="soft-panel p-4 text-left transition hover:border-cyan-400/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">{item.metric}</p>
                    <p className="mt-2 text-base font-semibold text-ink">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{item.subtitle}</p>
                  </div>
                  <span
                    className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full ${
                      item.progress === 100
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500"
                    }`}
                  >
                    <CheckCircle2 size={18} />
                  </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-200/80 dark:bg-slate-900">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass-card rounded-[30px] p-5">
            <p className="section-label">Quick Actions</p>
            <div className="mt-4 grid gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="soft-panel flex items-center justify-between px-4 py-3 text-sm font-medium text-ink transition hover:border-cyan-400/50"
                >
                  {action.label}
                  <ArrowRight size={16} className="text-muted" />
                </Link>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[30px] p-5">
            <p className="section-label">Today Status</p>
            <div className="mt-4 space-y-3">
              <div className="soft-panel flex items-center gap-3 px-4 py-3">
                <Flame size={18} className="text-orange-500" />
                <div>
                  <p className="text-sm text-muted">Calories</p>
                  <p className="text-base font-semibold text-ink">{nutrition.calories} kcal</p>
                </div>
              </div>
              <div className="soft-panel flex items-center gap-3 px-4 py-3">
                <Target size={18} className="text-cyan-500" />
                <div>
                  <p className="text-sm text-muted">Protein</p>
                  <p className="text-base font-semibold text-ink">{nutrition.protein}g</p>
                </div>
              </div>
              <div className="soft-panel flex items-center gap-3 px-4 py-3">
                <Footprints size={18} className="text-emerald-500" />
                <div>
                  <p className="text-sm text-muted">Steps goal</p>
                  <p className="text-base font-semibold text-ink">
                    {Number(progress.daily_plan.steps_goal).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="soft-panel flex items-center gap-3 px-4 py-3">
                <Droplets size={18} className="text-sky-500" />
                <div>
                  <p className="text-sm text-muted">Water goal</p>
                  <p className="text-base font-semibold text-ink">
                    {progress.daily_plan.water_intake}L
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-label">Weekly Overview</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                Minimal signal, clear read
              </h3>
            </div>
            <div className="metric-chip inline-flex items-center gap-2">
              <Sparkles size={14} />
              {progress.completed_workouts} sessions
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.05fr]">
            <div className="soft-panel p-4">
              <p className="text-sm text-muted">7-day streak</p>
              <p className="mt-2 font-display text-4xl font-semibold text-ink">
                {progress.streak_days}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {progress.completion_rate >= 75
                  ? "Solid week. Intensity thoda push kar sakte ho."
                  : "Discipline abhi build ho raha hai. Small wins count."}
              </p>
            </div>
            <div className="soft-panel p-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyMiniData}>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="4 4" />
                    <XAxis dataKey="week" stroke="currentColor" tick={{ fill: "currentColor", opacity: 0.55 }} />
                    <YAxis stroke="currentColor" tick={{ fill: "currentColor", opacity: 0.55 }} />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#38bdf8" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-label">Old Records</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                Last 7 days snapshot
              </h3>
            </div>
            <div className="metric-chip inline-flex items-center gap-2">
              <Trophy size={14} />
              {progress.completion_rate}% consistency
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="soft-panel p-4">
              <p className="text-sm font-medium text-ink">Weight progress</p>
              <div className="mt-3 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progress.weight_progress}>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="4 4" />
                    <XAxis dataKey="date" stroke="currentColor" tick={{ fill: "currentColor", opacity: 0.55 }} />
                    <YAxis stroke="currentColor" tick={{ fill: "currentColor", opacity: 0.55 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#22d3ee" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div className="soft-panel p-4">
                <p className="text-sm font-medium text-ink">Past workouts</p>
                <div className="mt-3 space-y-2">
                  {recentLogs.length === 0 ? (
                    <p className="text-sm text-muted">No workouts logged yet.</p>
                  ) : (
                    recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3 dark:border-slate-800/80 dark:bg-slate-900/70"
                      >
                        <p className="text-sm font-medium text-ink">{log.exercise_name}</p>
                        <p className="mt-1 text-sm text-muted">
                          {log.sets} sets x {log.reps} reps | {log.weight} kg
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="soft-panel p-4">
                <p className="text-sm font-medium text-ink">Past calories</p>
                <div className="mt-3 space-y-2">
                  {(recentCalories.length === 0 ? recentHistory : recentCalories).slice(-4).map((item, index) => (
                    <div
                      key={`${item.date || item.log_date}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3 text-sm dark:border-slate-800/80 dark:bg-slate-900/70"
                    >
                      <span className="text-muted">{item.date || item.log_date?.slice(5)}</span>
                      <span className="font-medium text-ink">
                        {item.calories ?? item.calories_intake ?? nutrition.calories} kcal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
