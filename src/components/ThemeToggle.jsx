import { motion } from "framer-motion";

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={onToggle}
      className="glass-card flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium text-ink"
    >
      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 dark:bg-cyan-300" />
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </motion.button>
  );
}
