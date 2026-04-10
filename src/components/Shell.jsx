import { NavLink, useNavigate } from "react-router-dom";
import { clearStoredToken, decodeToken } from "../services/api";
import Header from "./Header";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/workouts", label: "Workout" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/chat", label: "AI Chat" },
];

export default function Shell({ children, theme, onToggleTheme }) {
  const navigate = useNavigate();
  const displayName = decodeToken()?.name || "Profile";

  const handleLogout = () => {
    clearStoredToken();
    navigate("/", { replace: true });
  };

  return (
    <div className="relative z-20 min-h-screen px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
      <div className="app-shell flex flex-col gap-5">
        <Header
          displayName={displayName}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onProfile={() => navigate("/profile")}
          onLogout={handleLogout}
        />
        <main>{children}</main>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-40 lg:hidden">
        <div className="mx-auto flex w-[calc(100%-1rem)] max-w-xl items-center justify-between rounded-[24px] border border-slate-200/80 bg-white/95 px-2 py-2 shadow-xl backdrop-blur dark:border-slate-800/90 dark:bg-slate-950/95">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex-1 rounded-2xl px-3 py-3.5 text-center text-xs font-medium transition",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-300",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
