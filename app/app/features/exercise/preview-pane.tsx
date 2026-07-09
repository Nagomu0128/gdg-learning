// 右ペイン: 「あなたの結果 / 見本 / コンソール」タブ(DesignDoc §2.3 / SPEC E §3)。
// iframe は sandbox="allow-scripts" のみ(allow-same-origin 禁止 — §6.2)。
// コンソールは preview:console postMessage を 3 条件(source / origin "null" / nonce)で受理する(§5.5)。
import type { ConsoleEntry } from "@codesteps/lesson-kit";
import { TIMEOUT_MESSAGE_JP } from "@codesteps/lesson-kit";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { PREVIEW_CONSOLE_KIND } from "~/features/judge";
import type { PreviewState, PreviewTab, WorkerView } from "./types";

const TABS: { id: PreviewTab; label: string }[] = [
  { id: "result", label: "あなたの結果" },
  { id: "sample", label: "見本" },
  { id: "console", label: "コンソール" },
];

type ConsoleRow = { id: number; level: ConsoleEntry["level"]; text: string };

const MAX_CONSOLE_ROWS = 500;

function levelClass(level: ConsoleEntry["level"]): string {
  switch (level) {
    case "error":
      return "text-rose-300";
    case "warn":
      return "text-amber-300";
    case "info":
      return "text-sky-300";
    default:
      return "text-slate-100";
  }
}

function numberedRows(entries: ConsoleEntry[]): ConsoleRow[] {
  return entries.map((entry, index) => ({ id: index, level: entry.level, text: entry.text }));
}

function Placeholder(props: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <p className="text-center text-slate-500 text-sm">{props.text}</p>
    </div>
  );
}

function ConsoleSurface(props: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto bg-slate-900 p-3 font-mono text-xs leading-relaxed">
      {props.children}
    </div>
  );
}

/** worker 系レッスンの結果・見本(コンソール出力)表示 */
function WorkerConsoleView(props: { view: WorkerView | null; emptyText: string }) {
  const view = props.view;
  return (
    <ConsoleSurface>
      {view === null ? (
        <p className="text-slate-400">{props.emptyText}</p>
      ) : view.error !== null ? (
        <p className="text-amber-300">{view.error}</p>
      ) : (
        <>
          {view.syntaxError !== null && <p className="text-rose-300">{view.syntaxError.message}</p>}
          {view.timedOut && <p className="text-rose-300">{TIMEOUT_MESSAGE_JP}</p>}
          {view.console.length === 0 && view.syntaxError === null && !view.timedOut && (
            <p className="text-slate-400">コンソール出力はありませんでした</p>
          )}
          {numberedRows(view.console).map((row) => (
            <p key={row.id} className={levelClass(row.level)}>
              {row.text}
            </p>
          ))}
        </>
      )}
    </ConsoleSurface>
  );
}

export function PreviewPane(props: {
  runner: "dom" | "worker";
  activeTab: PreviewTab;
  onTabChange: (tab: PreviewTab) => void;
  resultPreview: PreviewState | null;
  samplePreview: PreviewState | null;
  workerResult: WorkerView | null;
  workerSample: WorkerView | null;
  /** 明示実行のたびに増える。iframe を強制再マウントして JS を再実行する */
  runId: number;
}) {
  const { activeTab, resultPreview, runId } = props;
  const isDom = props.runner === "dom";
  const resultFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [rows, setRows] = useState<ConsoleRow[]>([]);
  const nextIdRef = useRef(0);
  const nonce = resultPreview?.nonce ?? null;

  useEffect(() => {
    // srcdoc を差し替えたら(nonce 更新)コンソールをクリアして受信し直す
    setRows([]);
    if (nonce === null) return;
    function onMessage(event: MessageEvent) {
      // 受理 3 条件(§5.5): source 一致 / origin "null" / nonce 一致
      if (event.origin !== "null") return;
      const frame = resultFrameRef.current;
      if (frame === null || event.source !== frame.contentWindow) return;
      const msg = event.data as {
        kind?: unknown;
        nonce?: unknown;
        entry?: { level?: unknown; text?: unknown } | null;
      } | null;
      if (msg === null || typeof msg !== "object") return;
      if (msg.kind !== PREVIEW_CONSOLE_KIND || msg.nonce !== nonce) return;
      const entry = msg.entry;
      if (entry === null || entry === undefined || typeof entry.text !== "string") return;
      const text = entry.text;
      const level =
        entry.level === "info" || entry.level === "warn" || entry.level === "error" ? entry.level : "log";
      setRows((prev) => {
        if (prev.length >= MAX_CONSOLE_ROWS) return prev;
        nextIdRef.current += 1;
        return [...prev, { id: nextIdRef.current, level, text }];
      });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [nonce]);

  function openInNewTab() {
    const html = resultPreview?.html;
    if (html === undefined || html === "") return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-slate-200 border-b bg-slate-100 px-2 pt-2">
        <div role="tablist" aria-label="プレビュー" className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              data-testid={`preview-tab-${tab.id}`}
              onClick={() => props.onTabChange(tab.id)}
              className={clsx(
                "whitespace-nowrap rounded-t-lg px-3 py-1.5 text-sm",
                activeTab === tab.id
                  ? "border border-slate-200 border-b-white bg-white font-medium text-slate-900"
                  : "text-slate-600 hover:bg-slate-200",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {isDom && (
          <button
            type="button"
            onClick={openInNewTab}
            disabled={resultPreview === null || resultPreview.html === ""}
            className="mb-1 whitespace-nowrap rounded-lg px-2 py-1 text-slate-500 text-xs hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            新規タブで開く ↗
          </button>
        )}
      </div>

      <div className="relative min-h-0 flex-1 bg-white">
        {/* あなたの結果(タブ切替時も iframe の状態を保つため hidden で保持) */}
        <div
          className={clsx("h-full", activeTab !== "result" && "hidden")}
          role="tabpanel"
          aria-label="あなたの結果"
        >
          {isDom ? (
            resultPreview === null ? (
              <Placeholder text="プレビューを準備しています…" />
            ) : resultPreview.error !== null ? (
              <Placeholder text={resultPreview.error} />
            ) : (
              <iframe
                key={`run-${runId}`}
                ref={resultFrameRef}
                title="あなたの結果"
                sandbox="allow-scripts"
                srcDoc={resultPreview.html}
                className="h-full w-full"
              />
            )
          ) : (
            <WorkerConsoleView
              view={props.workerResult}
              emptyText="「▶ 実行」を押すとコンソール出力が表示されます"
            />
          )}
        </div>

        {/* 見本(§2.3: solution を同一実行系に通した結果) */}
        <div className={clsx("h-full", activeTab !== "sample" && "hidden")} role="tabpanel" aria-label="見本">
          {isDom ? (
            props.samplePreview === null ? (
              <Placeholder text="見本を準備しています…" />
            ) : props.samplePreview.error !== null ? (
              <Placeholder text={props.samplePreview.error} />
            ) : (
              <iframe
                title="見本"
                sandbox="allow-scripts"
                srcDoc={props.samplePreview.html}
                className="h-full w-full"
              />
            )
          ) : (
            <WorkerConsoleView view={props.workerSample} emptyText="見本を準備しています…" />
          )}
        </div>

        {/* コンソール */}
        <div
          className={clsx("h-full", activeTab !== "console" && "hidden")}
          role="tabpanel"
          aria-label="コンソール"
        >
          {isDom ? (
            <ConsoleSurface>
              {resultPreview?.jsSyntaxError != null && (
                <p className="text-rose-300">{resultPreview.jsSyntaxError.message}</p>
              )}
              {rows.length === 0 && resultPreview?.jsSyntaxError == null && (
                <p className="text-slate-400">コンソール出力はまだありません</p>
              )}
              {rows.map((row) => (
                <p key={row.id} className={levelClass(row.level)}>
                  {row.text}
                </p>
              ))}
            </ConsoleSurface>
          ) : (
            <WorkerConsoleView
              view={props.workerResult}
              emptyText="「▶ 実行」を押すとコンソール出力が表示されます"
            />
          )}
        </div>
      </div>
    </div>
  );
}
