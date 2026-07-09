import { clsx } from "clsx";

export function ProgressBar({
  value,
  max,
  label,
  className,
}: {
  value: number;
  max: number;
  label?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label ?? "進捗"}
      className={clsx("h-2 w-full overflow-hidden rounded-xl bg-slate-200", className)}
    >
      <div className="h-full rounded-xl bg-indigo-600 transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  );
}
