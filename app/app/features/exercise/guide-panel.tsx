// 左ペイン: 手順・スライドリンク・ヒント段階開放(DesignDoc §2.3, §2.4 / SPEC E §3)。
import { Link } from "react-router";
import type { LessonStatus } from "~/features/progress/types";

export function GuidePanel(props: {
  lessonTitle: string;
  estMinutes: number;
  courseSlug: string;
  lessonSlug: string;
  slideCount: number;
  status: LessonStatus;
  hints: string[];
  unlockedHintCount: number;
  failedCount: number;
  solutionAvailable: boolean;
}) {
  const unlocked = Math.min(props.unlockedHintCount, props.hints.length);
  const numberedHints = props.hints.map((text, index) => ({ text, n: index + 1 }));
  // 次のヒントは failed_count が 2×(開放済み+1) に達したとき開く(§7.3 の導出規則)
  const nextUnlockIn = Math.max(1, 2 * (unlocked + 1) - props.failedCount);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        {props.status === "passed" && (
          <span className="mb-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 text-xs">
            クリア済み
          </span>
        )}
        <h1 className="font-bold text-lg text-slate-900">{props.lessonTitle}</h1>
        <p className="mt-1 text-slate-500 text-xs">目安 {props.estMinutes} 分</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="font-semibold text-slate-700 text-sm">進め方</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-600 text-sm">
          <li>エディタの初期コードにあるコメントの指示を読みましょう</li>
          <li>コードを書いて、右のプレビューで結果を確かめましょう</li>
          <li>できあがったら「できた!」ボタンで判定しましょう</li>
        </ol>
        <Link
          to={`/courses/${props.courseSlug}/${props.lessonSlug}/slides/1`}
          className="mt-3 inline-block text-indigo-600 text-sm hover:underline"
        >
          ← スライドをもう一度見る(全{props.slideCount}枚)
        </Link>
      </section>

      <section aria-label="ヒント" className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="font-semibold text-slate-700 text-sm">ヒント</h2>
        {numberedHints.length === 0 ? (
          <p className="mt-2 text-slate-500 text-sm">このレッスンにヒントはありません</p>
        ) : (
          <div className="mt-2 space-y-2">
            {numberedHints.map((hint) =>
              hint.n <= unlocked ? (
                <div
                  key={hint.n}
                  data-testid={`hint-${hint.n}`}
                  className="rounded-lg bg-indigo-50 p-2 text-slate-700 text-sm"
                >
                  <span className="font-semibold text-indigo-600">ヒント{hint.n}: </span>
                  {hint.text}
                </div>
              ) : (
                <div key={hint.n} className="rounded-lg bg-slate-100 p-2 text-slate-400 text-sm">
                  ヒント{hint.n}(まだ開いていません)
                </div>
              ),
            )}
            {unlocked < numberedHints.length && (
              <p className="text-slate-500 text-xs">あと{nextUnlockIn}回挑戦すると次のヒントが開きます</p>
            )}
          </div>
        )}
        <p className="mt-3 text-slate-500 text-xs">
          {props.solutionAvailable
            ? "下のバーの「答えを見る」から答えを確認できます"
            : "すべてのヒントが開くと「答えを見る」が使えるようになります"}
        </p>
      </section>
    </div>
  );
}
