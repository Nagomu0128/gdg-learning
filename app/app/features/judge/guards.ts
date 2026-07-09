// postMessage で受け取るデータの形状ガード(親側)。
import type { ConsoleEntry, Verdict } from "@codesteps/lesson-kit";

export function isVerdict(value: unknown): value is Verdict {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.passed === "boolean" &&
    typeof v.timedOut === "boolean" &&
    Array.isArray(v.details) &&
    Array.isArray(v.console) &&
    (v.display === null || typeof v.display === "object")
  );
}

export function isConsoleEntry(value: unknown): value is ConsoleEntry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.level === "log" || v.level === "info" || v.level === "warn" || v.level === "error") &&
    typeof v.text === "string"
  );
}

export function messageRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}
