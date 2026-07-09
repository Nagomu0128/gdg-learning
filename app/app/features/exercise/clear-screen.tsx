// クリア画面オーバーレイ(DesignDoc §2.1 ピークエンド / SPEC E §4)。
// ストリーク更新・バッジ獲得を同一画面で演出する。アニメーションは prefers-reduced-motion を尊重。
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import type { SubmitResult } from "~/features/progress/types";

const CLEAR_ANIMATION_CSS = `
@keyframes cs-clear-pop {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes cs-badge-pop {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.cs-clear-card { animation: cs-clear-pop 0.35s ease-out both; }
.cs-badge-pop { animation: cs-badge-pop 0.45s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .cs-clear-card, .cs-badge-pop { animation: none; }
}
`;

export function ClearScreen(props: {
  result: SubmitResult;
  courseSlug: string;
  nextLessonSlug: string | null;
  onContinue: () => void;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  const { streak, newBadges } = props.result;

  return (
    <div
      data-testid="clear-screen"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
    >
      <style>{CLEAR_ANIMATION_CSS}</style>
      <div
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="レッスンクリア"
        onKeyDown={(event) => {
          if (event.key === "Escape") props.onContinue();
        }}
        className="cs-clear-card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xl outline-none"
      >
        <p aria-hidden="true" className="text-5xl">
          🎉
        </p>
        <h2 className="mt-3 font-bold text-3xl text-emerald-600">クリア!</h2>

        {streak !== null &&
          (streak.extended ? (
            <p className="mt-3 font-bold text-amber-600 text-lg">🔥 {streak.current}日連続で学習中!</p>
          ) : (
            <p className="mt-3 text-slate-600 text-sm">
              連続学習 {streak.current}日(最長 {streak.longest}日)
            </p>
          ))}

        {newBadges.length > 0 && (
          <div className="mt-5">
            <h3 className="font-semibold text-slate-700 text-sm">新しいバッジを獲得!</h3>
            <ul className="mt-2 space-y-2">
              {newBadges.map((badge) => (
                <li
                  key={badge.id}
                  className="cs-badge-pop flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left"
                >
                  <span aria-hidden="true" className="text-2xl">
                    {badge.icon}
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-800 text-sm">{badge.title}</span>
                    <span className="block text-slate-500 text-xs">{badge.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {props.nextLessonSlug !== null ? (
            <Link
              to={`/courses/${props.courseSlug}/${props.nextLessonSlug}/slides/1`}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              次のレッスンへ
            </Link>
          ) : (
            <Link
              to={`/courses/${props.courseSlug}`}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              コース一覧へ
            </Link>
          )}
          <button
            type="button"
            onClick={props.onContinue}
            className="rounded-xl px-4 py-2 text-slate-600 text-sm hover:bg-slate-100"
          >
            このまま続ける
          </button>
        </div>
      </div>
    </div>
  );
}
