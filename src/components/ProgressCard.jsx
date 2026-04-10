import { motion } from "framer-motion";

export default function ProgressCard({
  label,
  value,
  helper,
  progress,
  icon: Icon,
  tone = "from-emerald-400 to-teal-500",
}) {
  const safeProgress = Math.max(0, Math.min(progress ?? 0, 100));

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[26px] p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-2 font-display text-[1.9rem] font-semibold text-ink">{value}</p>
          {helper ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{helper}</p> : null}
        </div>
        {Icon ? (
          <div className={`rounded-2xl bg-gradient-to-br ${tone} p-3 text-white shadow-lg shadow-cyan-500/10`}>
            <Icon size={18} />
          </div>
        ) : null}
      </div>
      <div className="mt-5 h-2.5 rounded-full bg-slate-200/70 dark:bg-slate-900/90">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone}`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </motion.article>
  );
}
