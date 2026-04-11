import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND_NAME, BRAND_SHORT, BRAND_TAGLINE } from "../data/brand";
import {
  clearStoredToken,
  getStoredToken,
  loginUser,
  resolvePostLoginRoute,
  setStoredToken,
  signupUser,
} from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

const featurePills = [
  "JWT-secured coaching",
  "Memory + RAG responses",
  "Personalized training plans",
];

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const heading = useMemo(
    () => (mode === "login" ? "Welcome back" : "Create your KineAstraFit account"),
    [mode]
  );

  useEffect(() => {
    document.title = BRAND_NAME;
  }, []);

  useEffect(() => {
    if (!getStoredToken()) {
      return;
    }

    resolvePostLoginRoute()
      .then((route) => navigate(route, { replace: true }))
      .catch(() => {
        clearStoredToken();
        navigate("/", { replace: true });
      });
  }, [navigate]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleLogin = async () => {
    const payload = {
      email: form.email.trim(),
      password: form.password,
    };

    console.log("🔐 Sending login request...", payload.email);

    try {
      const response = await loginUser(payload);
      console.log("✅ LOGIN RESPONSE:", response.data);

      setStoredToken(response.data.access_token);

      const targetRoute = await resolvePostLoginRoute();
      console.log("→ Redirecting to:", targetRoute);
      navigate(targetRoute, {
        replace: true,
        state: { from: location.state?.from },
      });
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      throw err;
    }
  };

  const handleSignup = async () => {
    const payload = {
      email: form.email.trim(),
      password: form.password,
    };

    console.log("👤 Sending signup request...", payload.email);

    try {
      const signupResponse = await signupUser(payload);
      console.log("✅ SIGNUP RESPONSE:", signupResponse.data);
      await handleLogin();
    } catch (err) {
      console.error("❌ Signup failed:", err.response?.data || err.message);
      throw err;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    if (!form.email.trim() || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout - please try again")), 10000)
      );

      if (mode === "login") {
        await Promise.race([handleLogin(), timeoutPromise]);
      } else {
        await Promise.race([handleSignup(), timeoutPromise]);
      }
    } catch (err) {
      console.error("🚨 AUTH ERROR:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || err.message || "Authentication failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-20 min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="app-shell grid min-h-[calc(100vh-5rem)] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-[36px] border border-slate-200/70 bg-white/72 p-8 shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-950/72 sm:p-10 lg:p-14"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/12 via-transparent to-orange-400/8" />
          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-white/80 p-2 shadow-sm transition duration-200 hover:shadow-[0_0_24px_rgba(56,189,248,0.2)] dark:bg-slate-900/90">
                <img src="/logo.svg" alt={BRAND_NAME} className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-muted">{BRAND_SHORT}</p>
                <p className="text-sm text-muted">AI-led fitness discipline system</p>
              </div>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-slate-200/80 bg-white/80 px-4 py-1 text-xs uppercase tracking-[0.32em] text-muted dark:border-slate-700/80 dark:bg-slate-900/80">
              Premium Coaching Platform
            </p>
            <h2 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Train with structure, clarity, and coaching that actually feels useful.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
              {BRAND_TAGLINE}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {featurePills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/20 bg-white/55 px-4 py-2 text-sm text-ink dark:bg-slate-950/40"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Plans", value: "Adaptive" },
                { label: "Coach", value: "Memory-led" },
                { label: "Experience", value: "India-first" },
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-3xl p-4">
                  <p className="text-xs uppercase tracking-[0.26em] text-muted">
                    {item.label}
                  </p>
                  <p className="mt-3 font-display text-2xl font-semibold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-[32px] p-6 sm:p-8"
        >
          <div className="mb-6 flex rounded-full bg-white/35 p-1 dark:bg-slate-950/40">
            {["login", "signup"].map((value) => (
              <button
                key={value}
                onClick={() => {
                  setMode(value);
                  setError("");
                }}
                className={[
                  "flex-1 rounded-full px-4 py-3 text-sm font-medium capitalize transition",
                  mode === value
                    ? "bg-ink text-white dark:bg-white dark:text-slate-950"
                    : "text-muted",
                ].join(" ")}
              >
                {value}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                {mode === "login" ? "Secure access" : "Start your setup"}
              </p>
              <h3 className="mt-3 font-display text-3xl font-semibold text-ink">
                {heading}
              </h3>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-muted">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-white/15 bg-white/60 px-4 py-3 text-base text-ink outline-none ring-0 placeholder:text-muted focus:border-accent/60 dark:bg-slate-950/40"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-2xl border border-white/15 bg-white/60 px-4 py-3 text-base text-ink outline-none ring-0 placeholder:text-muted focus:border-accent/60 dark:bg-slate-950/40"
                placeholder="Minimum 6 characters"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 dark:text-rose-100">
                {error}
              </div>
            ) : null}

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-orange-400 px-4 py-3.5 font-medium text-white shadow-[0_20px_45px_rgba(14,165,233,0.28)] transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Login to Dashboard"
                  : "Create Account and Continue"}
            </motion.button>
          </form>
        </motion.section>
      </div>
    </div>
  );
}
