import { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "./components/ProtectedRoute";
import { BRAND_NAME } from "./data/brand";
import { TOKEN_KEY, getStoredToken, THEME_KEY } from "./services/api";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const WorkoutLoggerPage = lazy(() => import("./pages/WorkoutLoggerPage"));
const NutritionPage = lazy(() => import("./pages/NutritionPage"));
const ThreeBackground = lazy(() => import("./components/ThreeBackground"));
const Shell = lazy(() => import("./components/Shell"));

function AppLoader() {
  return (
    <div className="relative z-20 flex min-h-screen items-center justify-center px-6">
      <div className="glass-card rounded-[28px] px-6 py-4 text-sm text-muted">
        Loading your AI fitness workspace...
      </div>
    </div>
  );
}

function PageTransition({ theme, onToggleTheme }) {
  const location = useLocation();

  return (
    <Suspense fallback={<AppLoader />}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative min-h-screen"
        >
          <Routes location={location}>
            <Route path="/" element={<AuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <Shell theme={theme} onToggleTheme={onToggleTheme}>
                    <Outlet />
                  </Shell>
                }
              >
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/workouts" element={<WorkoutLoggerPage />} />
                <Route path="/nutrition" element={<NutritionPage />} />
                <Route path="/chat" element={<ChatPage />} />
              </Route>
            </Route>
            <Route
              path="*"
              element={<Navigate to={getStoredToken() ? "/dashboard" : "/"} replace />}
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.title = BRAND_NAME;
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-ink transition-colors duration-300">
      <Suspense fallback={null}>
        <ThreeBackground theme={theme} />
      </Suspense>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-white/25 via-white/5 to-transparent dark:from-slate-950/35 dark:via-slate-950/5" />
      <PageTransition
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
    </div>
  );
}
