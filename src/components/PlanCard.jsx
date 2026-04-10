import { CheckCircle2, Circle } from "lucide-react";

export default function PlanCard({
  title,
  items,
  onToggle,
  accent = "from-cyan-500 to-sky-500",
}) {
  return (
    <div className="glass-card rounded-[28px] p-5">
      <div className={`h-1.5 rounded-full bg-gradient-to-r ${accent}`} />
      <h4 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h4>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/15 bg-white/35 px-4 py-3 text-sm dark:bg-slate-950/30"
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onToggle(item.id)}
              className="sr-only"
            />
            <span className="mt-0.5 text-cyan-500">
              {item.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </span>
            <span className="flex-1">
              <span className="block font-medium text-ink">{item.label}</span>
              {item.meta ? <span className="mt-1 block text-muted">{item.meta}</span> : null}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
