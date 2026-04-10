import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MapPinned, PencilLine, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProfile, saveProfile } from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

const goals = ["fat loss", "muscle gain", "recomposition", "maintenance"];
const diets = ["veg", "non-veg", "vegan", "high-protein"];
const activityLevels = ["low", "moderate", "high", "athlete"];
const fitnessLevels = ["beginner", "intermediate", "advanced"];
const regions = [
  { label: "India", value: "india", helper: "Roti, dal, paneer, tiffin, ghar ka khana" },
  { label: "Global", value: "global", helper: "Standard international food and training references" },
];
const workoutPreferences = [
  "Push / Pull / Legs",
  "Upper / Lower Split",
  "Full Body",
  "Home Workouts",
  "Strength Focus",
];

const emptyForm = {
  name: "",
  email: "",
  age: "",
  weight: "",
  height: "",
  goal: "fat loss",
  diet: "veg",
  activity_level: "moderate",
  fitness_level: "beginner",
  region: "india",
  target_weight: "",
  workout_preference: "Push / Pull / Legs",
  medical_notes: "",
};

function InfoField({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <input type={type} name={name} value={value} onChange={onChange} required className="kine-input" />
    </label>
  );
}

export default function ProfilePage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getProfile();
        const profile = response.data;
        setForm({
          name: profile.name ?? "",
          email: profile.email ?? "",
          age: profile.age ? String(profile.age) : "",
          weight: profile.weight ? String(profile.weight) : "",
          height: profile.height ? String(profile.height) : "",
          goal: profile.goal ?? "fat loss",
          diet: profile.diet ?? "veg",
          activity_level: profile.activity_level ?? "moderate",
          fitness_level: profile.fitness_level ?? "beginner",
          region: profile.region ?? "india",
          target_weight: profile.target_weight ? String(profile.target_weight) : "",
          workout_preference: profile.workout_preference ?? "Push / Pull / Legs",
          medical_notes: profile.medical_notes ?? "",
        });
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(getErrorMessage(err) || "Unable to load your profile.");
        }
      } finally {
        setBootLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await saveProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        goal: form.goal,
        diet: form.diet,
        activity_level: form.activity_level,
        fitness_level: form.fitness_level,
        region: form.region,
        target_weight: Number(form.target_weight),
        workout_preference: form.workout_preference,
        medical_notes: form.medical_notes.trim() || null,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err) || "Could not save your profile.");
    } finally {
      setLoading(false);
    }
  };

  const completenessScore = useMemo(() => {
    const filled = Object.values(form).filter((value) => String(value).trim().length > 0).length;
    return Math.min(100, Math.round((filled / Object.keys(form).length) * 100));
  }, [form]);

  if (bootLoading) {
    return (
      <div className="glass-card rounded-[30px] p-8 text-center text-muted">
        Loading your profile...
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
            <p className="section-label">Profile</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Full control over your coaching setup
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              Keep the profile sharp and the coach stays useful. Goal, region, activity, and body stats do the heavy lifting here.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Completion</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {completenessScore}%
                </p>
              </div>
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Goal</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">{form.goal}</p>
              </div>
              <div className="soft-panel p-4">
                <p className="text-sm text-muted">Lifestyle</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">{form.region}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-white/82 p-4 dark:border-slate-800/80 dark:bg-slate-900/76">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950">
                  <UserRound size={18} />
                </div>
                <div>
                  <p className="text-base font-semibold text-ink">{form.name || "Your profile"}</p>
                  <p className="text-sm text-muted">Editable anytime. Coach updates after save.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:pl-0">
            <div className="soft-panel h-full p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-label">Readiness</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                    Profile score
                  </h3>
                </div>
                <MapPinned size={18} className="text-cyan-500" />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Coaching quality</span>
                  <span className="font-medium text-ink">{completenessScore}%</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-slate-200/80 dark:bg-slate-950">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-orange-400"
                    style={{ width: `${completenessScore}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  "Goal + activity level set your calories.",
                  "Region changes meal language and food suggestions.",
                  "Weight + height improve plan accuracy fast.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[18px] bg-slate-50 px-3 py-3 text-sm dark:bg-slate-950/70">
                    <CheckCircle2 size={16} className="mt-0.5 text-cyan-500" />
                    <span className="text-muted">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <PencilLine size={18} className="text-cyan-500" />
            <div>
              <p className="section-label">Identity</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                Basic details
              </h3>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoField label="Name" name="name" value={form.name} onChange={handleChange} />
            <InfoField label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
            <InfoField label="Age" name="age" value={form.age} onChange={handleChange} type="number" />
            <InfoField label="Height (cm)" name="height" value={form.height} onChange={handleChange} type="number" />
            <InfoField label="Weight (kg)" name="weight" value={form.weight} onChange={handleChange} type="number" />
            <InfoField
              label="Target Weight (kg)"
              name="target_weight"
              value={form.target_weight}
              onChange={handleChange}
              type="number"
            />
          </div>
        </div>

        <div className="glass-card rounded-[30px] p-5 sm:p-6">
          <div>
            <p className="section-label">Lifestyle</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
              Training setup
            </h3>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-muted">Goal</span>
              <select name="goal" value={form.goal} onChange={handleChange} className="kine-input">
                {goals.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Diet</span>
              <select name="diet" value={form.diet} onChange={handleChange} className="kine-input">
                {diets.map((diet) => (
                  <option key={diet} value={diet}>
                    {diet}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Activity Level</span>
              <select
                name="activity_level"
                value={form.activity_level}
                onChange={handleChange}
                className="kine-input"
              >
                {activityLevels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Fitness Level</span>
              <select
                name="fitness_level"
                value={form.fitness_level}
                onChange={handleChange}
                className="kine-input"
              >
                {fitnessLevels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5">
            <span className="mb-3 block text-sm text-muted">Choose your lifestyle</span>
            <div className="grid gap-3 sm:grid-cols-2">
              {regions.map((region) => (
                <button
                  key={region.value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, region: region.value }))}
                  className={`rounded-[22px] border px-4 py-4 text-left transition ${
                    form.region === region.value
                      ? "border-cyan-400/60 bg-cyan-50 text-slate-900 dark:border-cyan-400/60 dark:bg-cyan-500/10 dark:text-slate-100"
                      : "border-slate-200/80 bg-white text-slate-700 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{region.label}</p>
                      <p className="mt-1 text-sm text-muted">{region.helper}</p>
                    </div>
                    {form.region === region.value ? <CheckCircle2 size={18} /> : null}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm text-muted">Workout Preference</span>
            <select
              name="workout_preference"
              value={form.workout_preference}
              onChange={handleChange}
              className="kine-input"
            >
              {workoutPreferences.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="glass-card rounded-[30px] p-5 sm:p-6 xl:col-span-2">
          <div>
            <p className="section-label">Notes</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
              Anything the coach should respect
            </h3>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-sm text-muted">Medical Notes (optional)</span>
              <textarea
                rows={4}
                name="medical_notes"
                value={form.medical_notes}
                onChange={handleChange}
                className="kine-input min-h-[120px] resize-none"
                placeholder="Injuries, movement limits, or recovery notes."
              />
            </label>

            <div className="flex flex-col gap-3 lg:w-[220px]">
              <button disabled={loading} className="kine-button-primary w-full">
                {loading ? "Saving..." : "Save profile"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-[20px] border border-rose-300/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/20 dark:text-rose-200">
              {error}
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
