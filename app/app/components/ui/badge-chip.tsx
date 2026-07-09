import { clsx } from "clsx";
import type { ReactNode } from "react";

export function BadgeChip({
  icon,
  title,
  earned = true,
  className,
}: {
  icon?: ReactNode;
  title: string;
  earned?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 font-medium text-sm",
        earned
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-slate-200 bg-slate-100 text-slate-500",
        className,
      )}
    >
      {icon != null ? <span aria-hidden="true">{icon}</span> : null}
      <span>{title}</span>
    </span>
  );
}
