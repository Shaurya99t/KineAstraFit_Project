import { motion } from "framer-motion";

export default function ChartCard({
  eyebrow,
  title,
  description,
  icon: Icon,
  accentClass = "from-cyan-500 to-sky-500",
  children,
  action,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[30px] p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="section-label">{eyebrow}</p>
          ) : null}
          <h3 className="mt-2 font-display text-[1.55rem] font-semibold text-ink">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          {action}
          {Icon ? (
            <div className={`rounded-2xl bg-gradient-to-br ${accentClass} p-3 text-white shadow-lg shadow-cyan-500/10`}>
              <Icon size={20} />
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}
