import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, MoonStar, SunMedium, UserRound } from "lucide-react";
import { BRAND_SHORT } from "../data/brand";

export default function ProfileDropdown({
  displayName,
  theme,
  onToggleTheme,
  onProfile,
  onLogout,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const initial = (displayName || "P").charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = [
    {
      label: "Profile Settings",
      icon: UserRound,
      onClick: () => {
        setOpen(false);
        onProfile();
      },
    },
    {
      label: theme === "dark" ? "Light Mode" : "Dark Mode",
      icon: theme === "dark" ? SunMedium : MoonStar,
      onClick: () => {
        onToggleTheme();
        setOpen(false);
      },
    },
    {
      label: "Logout",
      icon: LogOut,
      danger: true,
      onClick: () => {
        setOpen(false);
        onLogout();
      },
    },
  ];

  return (
    <div className="relative z-50 overflow-visible" ref={menuRef}>
      <button
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/85 px-2.5 py-2 pr-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-slate-800/80 dark:bg-slate-950/88 dark:text-slate-100 dark:hover:bg-slate-900"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-semibold text-slate-950">
          {initial}
        </span>
        <span className="hidden text-sm sm:inline">{displayName}</span>
        <ChevronDown size={16} className={`${open ? "rotate-180" : ""} transition-transform`} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0B1220] p-2 shadow-2xl z-[9999] backdrop-blur-none"
          >
            <div className="px-3 pb-2 pt-1">
              <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">{BRAND_SHORT}</p>
            </div>
            {items.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={[
                  "flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm transition cursor-pointer",
                  item.danger
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-slate-100 hover:bg-[#1a2335]",
                ].join(" ")}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
