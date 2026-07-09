// ストリーク更新規則(DesignDoc §9.2)。純粋関数 — DB 依存なし。
// last_active_date == today → 変更なし / == 昨日 → +1 / それ以外 → 1 にリセット。
// longest = max(longest, current)。
import { jstYesterday } from "./jst";

export type StreakInput = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // "YYYY-MM-DD"(JST)
};

export type StreakResult = {
  current: number;
  longest: number;
  lastActiveDate: string;
  /** この合格でストリークが進んだか(同日 2 回目以降は false) */
  extended: boolean;
};

export function applyPassToStreak(prev: StreakInput, todayJst: string): StreakResult {
  if (prev.lastActiveDate === todayJst) {
    return {
      current: prev.currentStreak,
      longest: Math.max(prev.longestStreak, prev.currentStreak),
      lastActiveDate: todayJst,
      extended: false,
    };
  }
  const current = prev.lastActiveDate === jstYesterday(todayJst) ? prev.currentStreak + 1 : 1;
  return {
    current,
    longest: Math.max(prev.longestStreak, current),
    lastActiveDate: todayJst,
    extended: true,
  };
}
