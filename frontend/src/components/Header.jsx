import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { BRAND_NAME, BRAND_SHORT } from "../data/brand";
import ProfileDropdown from "./ProfileDropdown";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/workouts", label: "Workout" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/chat", label: "AI Chat" },
];

export default function Header({
  displayName,
  theme,
  onToggleTheme,
  onProfile,
  onLogout,
}) {
  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card relative z-50 overflow-visible flex items-center justify-between rounded-[24px] px-4 py-4 lg:hidden"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/80 p-2 shadow-sm transition duration-200 hover:shadow-[0_0_24px_rgba(56,189,248,0.2)] dark:bg-slate-900/90">
            <img src="/logo.svg" alt={BRAND_NAME} className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">{BRAND_SHORT}</p>
            <h1 className="mt-1 font-display text-lg font-semibold text-ink">AI fitness system</h1>
          </div>
        </div>
        <ProfileDropdown
          displayName={displayName}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onProfile={onProfile}
          onLogout={onLogout}
        />
      </motion.header>

      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card relative z-50 hidden overflow-visible items-center justify-between rounded-[26px] px-5 py-4 lg:flex"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/80 p-2 shadow-sm transition duration-200 hover:shadow-[0_0_24px_rgba(56,189,248,0.2)] dark:bg-slate-900/90">
            <img src="/logo.svg" alt={BRAND_NAME} className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">{BRAND_SHORT}</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
              KineAstraFit AI Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "rounded-full px-4 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-white/70 text-slate-700 hover:bg-white dark:bg-slate-900/75 dark:text-slate-200 dark:hover:bg-slate-800",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <ProfileDropdown
            displayName={displayName}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onProfile={onProfile}
            onLogout={onLogout}
          />
        </div>
      </motion.header>
    </>
  );
}
