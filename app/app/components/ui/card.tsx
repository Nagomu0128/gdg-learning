import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

export function Card({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={clsx("rounded-xl border border-slate-200 bg-white p-4 shadow-sm", className)}
      {...props}
    />
  );
}
