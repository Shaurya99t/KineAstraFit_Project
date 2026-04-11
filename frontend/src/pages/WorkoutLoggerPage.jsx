import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Clock3,
  Dumbbell,
  Flame,
  Play,
  Square,
  Target,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "../components/ChartCard";
import ProgressCard from "../components/ProgressCard";
import { getWorkoutBlueprint } from "../data/workoutBlueprints";
import { createWorkoutLog, getWorkoutLogs, getWorkoutProgress } from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

const buildInitialForm = () => ({
  exercise_name: "",
  sets: "3",
  reps: "10",
  weight: "0",
  date: new Date().toISOString().slice(0, 10),
});

function formatTimer(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function WorkoutLoggerPage() {
  const [form, setForm] = useState(buildInitialForm);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorkoutData() {
      try {
        const [logsResponse, progressResponse] = await Promise.all([
          getWorkoutLogs(),
          getWorkoutProgress(),
        ]);
        setLogs(logsResponse.data);
        setProgress(progressResponse.data);
      } catch (err) {
        setError(getErrorMessage(err) || "Unable to load workout data.");
      } finally {
        setLoading(false);
      }
    }

    loadWorkoutData();
  }, []);

  useEffect(() => {
    if (!timerActive) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setTimerSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerActive]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const refreshWorkoutData = async () => {
    const [logsResponse, progressResponse] = await Promise.all([
      getWorkoutLogs(),
      getWorkoutProgress(),
    ]);
    setLogs(logsResponse.data);
    setProgress(progressResponse.data);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createWorkoutLog({
        exercise_name: form.exercise_name.trim(),
        sets: Number(form.sets),
        reps: Number(form.reps),
        weight: Number(form.weight),
        date: form.date,
      });
      setForm(buildInitialForm());
      await refreshWorkoutData();
    } catch (err) {
      setError(getErrorMessage(err) || "Unable to save workout log.");
    } finally {
      setSaving(false);
    }
  };

  const blueprint = useMemo(
    () => getWorkoutBlueprint(progress?.daily_plan?.workout_type || ""),
    [progress?.daily_plan?.workout_type]
  );

  const weeklyChartData = progress?.weekly_consistency || [];
  const recentLogs = logs.slice(0, 8);

  if (loading) {
    return (
      <div className="glass-card rounded-[30px] p-8 text-center text-muted">
        Loading workout mode...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden rounded-[32px]"
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 sm:p-8">
            <p className="section-label">Workout</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              {progress?.daily_plan?.workout_type || "Training day"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              Start the session, stay on the main lifts, and log the numbers while the set is fresh in your head.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Intensity</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {progress?.daily_plan?.intensity || "moderate"}
                </p>
              </div>
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Fatigue</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {progress?.fatigue || 0}/100
                </p>
              </div>
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Consistency</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {progress?.completion_rate || 0}%
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setTimerActive(true)}
                className="kine-button-primary"
              >
                <Play size={16} className="mr-2" />
                Start workout mode
              </button>
              <button
                onClick={() => setTimerActive(false)}
                className="kine-button-secondary"
              >
                <Square size={16} className="mr-2" />
                Pause timer
              </button>
            </div>

            <div className="mt-6 soft-panel flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted">Session timer</p>
                <p className="mt-2 font-display text-3xl font-semibold text-ink">
                  {formatTimer(timerSeconds)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/80">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Clock3 size={16} />
                  Rest periods
                </div>
                <p className="mt-2 text-sm text-ink">
                  {progress?.fatigue >= 70 ? "90 sec cap" : "60-75 sec cap"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden">
            <img src={blueprint.image} alt={blueprint.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <p className="section-label text-slate-300">Workout focus</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-200">
                {progress?.daily_plan?.tip || "Keep the first compound movement honest and the rest clean."}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Exercise Flow</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                Session blueprint
              </h3>
            </div>
            <div className="metric-chip">{blueprint.title}</div>
          </div>

          <div className="mt-5 grid gap-3">
            {blueprint.exercises.map((exercise) => (
              <div
                key={exercise.name}
                className="soft-panel flex items-start justify-between gap-4 p-4"
              >
                <div>
                  <p className="text-base font-semibold text-ink">{exercise.name}</p>
                  <p className="mt-1 text-sm text-muted">{exercise.focus}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink">{exercise.sets} sets</p>
                  <p className="mt-1 text-sm text-muted">{exercise.reps} reps</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Log Weights</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                Save the working sets
              </h3>
            </div>
            <Dumbbell size={18} className="text-cyan-500" />
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-muted">Exercise</span>
              <input
                type="text"
                name="exercise_name"
                value={form.exercise_name}
                onChange={handleChange}
                required
                className="kine-input"
                placeholder="Bench press"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Sets</span>
              <input
                type="number"
                name="sets"
                value={form.sets}
                min="1"
                onChange={handleChange}
                required
                className="kine-input"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Reps</span>
              <input
                type="number"
                name="reps"
                value={form.reps}
                min="1"
                onChange={handleChange}
                required
                className="kine-input"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Weight (kg)</span>
              <input
                type="number"
                name="weight"
                value={form.weight}
                min="0"
                onChange={handleChange}
                required
                className="kine-input"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Date</span>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="kine-input"
              />
            </label>

            {error ? (
              <div className="md:col-span-2 rounded-[20px] border border-rose-300/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/20 dark:text-rose-200">
                {error}
              </div>
            ) : null}

            <button disabled={saving} className="kine-button-primary md:col-span-2">
              {saving ? "Saving log..." : "Save workout log"}
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ProgressCard
          label="Fatigue"
          value={`${progress?.fatigue || 0}/100`}
          helper="Load signal"
          progress={progress?.fatigue || 0}
          icon={Flame}
          tone="from-orange-400 to-red-500"
        />
        <ProgressCard
          label="Completion"
          value={`${progress?.completion_rate || 0}%`}
          helper="Weekly consistency"
          progress={progress?.completion_rate || 0}
          icon={Target}
          tone="from-emerald-400 to-teal-500"
        />
        <ProgressCard
          label="Streak"
          value={`${progress?.streak_days || 0} days`}
          helper="Current run"
          progress={Math.min((progress?.streak_days || 0) * 12, 100)}
          icon={Activity}
          tone="from-cyan-500 to-sky-500"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard
          eyebrow="Weekly Progress"
          title="Workout frequency"
          description="Small enough to read quickly, useful enough to act on."
          icon={Target}
          accentClass="from-cyan-500 to-sky-500"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="4 4" />
                <XAxis dataKey="week" stroke="currentColor" tick={{ fill: "currentColor", opacity: 0.55 }} />
                <YAxis stroke="currentColor" tick={{ fill: "currentColor", opacity: 0.55 }} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#22d3ee" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="glass-card rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Recent Logs</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                Last saved sets
              </h3>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {recentLogs.length === 0 ? (
              <div className="soft-panel p-4 text-sm text-muted">
                No workout logs yet. Start with the first working set.
              </div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="soft-panel p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-ink">{log.exercise_name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {log.sets} sets x {log.reps} reps @ {log.weight} kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-ink">{log.date}</p>
                      <p className="mt-1 text-sm text-muted">Intensity {log.intensity}/100</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
