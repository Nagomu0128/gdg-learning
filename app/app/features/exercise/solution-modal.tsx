// 「答えを見る」モーダル(DesignDoc §2.4 / SPEC E §3)。
// solution は必ずテキストとしてエスケープ描画(React の {} 描画 — §10.2)。コピー可・読み取り専用。
import { useEffect, useRef } from "react";

export function SolutionModal(props: { solution: Record<string, string>; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      props.onClose();
      return;
    }
    if (event.key !== "Tab") return;
    // 簡易フォーカストラップ(§10.5)
    const root = dialogRef.current;
    if (root === null) return;
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>("button, a[href], [tabindex]:not([tabindex='-1'])"),
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (first === undefined || last === undefined) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function copyFile(code: string) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // クリップボード不可の環境では黙って何もしない(手動コピーは可能)
    }
  }

  const files = Object.entries(props.solution);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="答え"
        data-testid="solution-modal"
        onKeyDown={handleKeyDown}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-slate-200 border-b px-4 py-3">
          <h2 className="font-bold text-slate-900">答え</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={props.onClose}
            className="rounded-lg px-2 py-1 text-slate-500 text-sm hover:bg-slate-100"
          >
            閉じる
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {files.length === 0 && <p className="text-slate-500 text-sm">答えのデータがありません</p>}
          {files.map(([name, code]) => (
            <section key={name}>
              <div className="flex items-center justify-between">
                <h3 className="font-mono font-semibold text-slate-700 text-sm">{name}</h3>
                <button
                  type="button"
                  onClick={() => {
                    void copyFile(code);
                  }}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-slate-600 text-xs hover:bg-slate-100"
                >
                  コピー
                </button>
              </div>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-slate-100 text-xs leading-relaxed">
                {code}
              </pre>
            </section>
          ))}
        </div>
        <p className="border-slate-200 border-t px-4 py-2 text-slate-500 text-xs">
          写して終わりにせず、どこが違ったか自分のコードと見比べてみましょう
        </p>
      </div>
    </div>
  );
}
