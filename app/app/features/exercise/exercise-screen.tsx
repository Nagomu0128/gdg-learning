// 演習画面本体(DesignDoc §2.3 / SPEC E)。3ペイン + 下部バー + クリア演出。
// client-only(route が lesson ロード後にのみマウントする)。judge/progress が未実装(スタブ)でも
// クラッシュしないよう、judge() / composePreview / runWorkerConsole / action 応答をすべてガードする。
import type { FileMap, Verdict } from "@codesteps/lesson-kit";
import { TIMEOUT_MESSAGE_JP } from "@codesteps/lesson-kit";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { CodeEditor } from "~/features/editor/code-editor";
import { clearDraft, editableSubset, loadDraft, restoreFiles, saveDraft } from "~/features/editor/draft";
import { FileTabs } from "~/features/editor/file-tabs";
import { FileTree } from "~/features/editor/file-tree";
import { composePreview, judge, runWorkerConsole } from "~/features/judge";
import type { ExerciseState, SubmitResult } from "~/features/progress/types";
import type { LoadedLesson } from "~/generated/lessons.client";
import { ClearScreen } from "./clear-screen";
import { GuidePanel } from "./guide-panel";
import { PreviewPane } from "./preview-pane";
import { SolutionModal } from "./solution-modal";
import type { ExerciseActionData, PreviewState, PreviewTab, WorkerView } from "./types";

const JUDGE_ERROR_MESSAGE = "判定に失敗しました。もう一度お試しください";
const PREVIEW_UNAVAILABLE = "プレビュー機能を準備中です(判定エンジン未接続)";
const RUN_UNAVAILABLE = "実行機能を準備中です(判定エンジン未接続)";

type MobilePane = "guide" | "code" | "preview";

const MOBILE_PANES: { id: MobilePane; label: string }[] = [
  { id: "guide", label: "手順" },
  { id: "code", label: "コード" },
  { id: "preview", label: "プレビュー" },
];

function failMessage(verdict: Verdict): string {
  if (verdict.display !== null) return verdict.display.message;
  if (verdict.timedOut) return TIMEOUT_MESSAGE_JP;
  return "不合格です。コードを見直してみましょう";
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent motion-reduce:animate-none"
    />
  );
}

export type ExerciseScreenProps = {
  lesson: LoadedLesson;
  courseSlug: string;
  lessonTitle: string;
  exercise: ExerciseState;
  nextLessonSlug: string | null;
  slideCount: number;
};

export default function ExerciseScreen(props: ExerciseScreenProps) {
  const { lesson, courseSlug, exercise } = props;
  const lessonSlug = lesson.meta.slug;
  const lessonFiles = lesson.files;
  const isDom = lesson.meta.runner === "dom";

  const visibleFiles = useMemo(
    () =>
      Object.entries(lessonFiles)
        .filter(([, file]) => !file.hidden)
        .map(([name, file]) => ({ name, editable: file.editable })),
    [lessonFiles],
  );
  // 実行スクリプト(.js/.ts/.tsx/.jsx)は「▶ 実行」での明示再実行が必要(§2.3)
  const hasJs = useMemo(
    () => Object.keys(lessonFiles).some((name) => /\.(js|ts|tsx|jsx)$/.test(name)),
    [lessonFiles],
  );
  const showRun = hasJs || !isDom;
  // ファイル数 >= 3 なら md 以上でタブの代わりに左サイドのツリーペインを表示(CURRICULUM-2)。
  // md 未満は常にタブ(タブ UI はレスポンシブ用に常時レンダリングし CSS で切替)。
  const useFileTree = visibleFiles.length >= 3;

  // ---- エディタ状態(FileMap 一元管理。hidden 含む全ファイルの現在値) ----
  const [files, setFiles] = useState<FileMap>(() =>
    restoreFiles(
      lessonFiles,
      typeof window === "undefined" ? null : loadDraft(window.localStorage, lessonSlug),
    ),
  );
  const [activeFile, setActiveFile] = useState<string>(() => visibleFiles[0]?.name ?? "");
  const activeMeta = lessonFiles[activeFile];
  const lastChangedFileRef = useRef<string | null>(null);

  const handleEditorChange = useCallback(
    (value: string) => {
      lastChangedFileRef.current = activeFile;
      setFiles((prev) => ({ ...prev, [activeFile]: value }));
    },
    [activeFile],
  );

  // 下書き自動保存(1s デバウンス — §2.3)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window === "undefined") return;
      saveDraft(window.localStorage, lessonSlug, editableSubset(lessonFiles, files));
    }, 1000);
    return () => clearTimeout(timer);
  }, [files, lessonSlug, lessonFiles]);

  // ---- プレビュー(§2.3: HTML/CSS 300ms 追従、JS は明示実行のみ) ----
  const [resultPreview, setResultPreview] = useState<PreviewState | null>(null);
  const [samplePreview, setSamplePreview] = useState<PreviewState | null>(null);
  const [workerResult, setWorkerResult] = useState<WorkerView | null>(null);
  const [workerSample, setWorkerSample] = useState<WorkerView | null>(null);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("result");
  const [runId, setRunId] = useState(0);
  const [running, setRunning] = useState(false);

  const composeSafely = useCallback(
    async (target: FileMap): Promise<PreviewState> => {
      try {
        // composePreview は TS/TSX/JSX レッスンで sucrase を遅延ロードするため async(L-runtime)
        const { html, nonce, jsSyntaxError } = await composePreview({
          files: target,
          lessonSlug,
          origin: window.location.origin,
        });
        return { html, nonce, jsSyntaxError, error: null };
      } catch (err) {
        console.error("composePreview に失敗:", err);
        return { html: "", nonce: "", jsSyntaxError: null, error: PREVIEW_UNAVAILABLE };
      }
    },
    [lessonSlug],
  );

  useEffect(() => {
    if (!isDom) return;
    const changed = lastChangedFileRef.current;
    // JS 系(実行スクリプト)の編集ではプレビューを更新しない(明示実行のみ — §2.3)
    if (changed !== null && /\.(js|ts|tsx|jsx)$/.test(changed)) return;
    const delay = changed === null ? 0 : 300;
    let cancelled = false;
    const timer = setTimeout(() => {
      void composeSafely(files).then((preview) => {
        if (!cancelled) setResultPreview(preview);
      });
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [files, isDom, composeSafely]);

  const handleRun = useCallback(async () => {
    if (isDom) {
      lastChangedFileRef.current = null;
      setResultPreview(await composeSafely(files));
      setRunId((id) => id + 1); // JS を再実行するため iframe を再マウント
      return;
    }
    if (running) return;
    setRunning(true);
    try {
      const result = await runWorkerConsole(files);
      setWorkerResult({ ...result, error: null });
    } catch (err) {
      console.error("runWorkerConsole に失敗:", err);
      setWorkerResult({ console: [], timedOut: false, syntaxError: null, error: RUN_UNAVAILABLE });
    } finally {
      setRunning(false);
    }
  }, [isDom, composeSafely, files, running]);

  const triggerRun = useCallback(() => {
    void handleRun();
  }, [handleRun]);

  // 見本(§2.3 ADR #15): solution を同一実行系に通した結果。タブ初回表示時に遅延生成
  const solutionFiles = useMemo(() => {
    const map: FileMap = {};
    for (const [name, file] of Object.entries(lessonFiles)) map[name] = file.initial;
    return { ...map, ...lesson.solution };
  }, [lessonFiles, lesson.solution]);
  const sampleWorkerRequestedRef = useRef(false);

  useEffect(() => {
    if (previewTab !== "sample") return;
    if (isDom) {
      if (samplePreview === null) {
        void composeSafely(solutionFiles).then(setSamplePreview);
      }
      return;
    }
    if (sampleWorkerRequestedRef.current) return;
    sampleWorkerRequestedRef.current = true;
    void (async () => {
      try {
        const result = await runWorkerConsole(solutionFiles);
        setWorkerSample({ ...result, error: null });
      } catch (err) {
        console.error("runWorkerConsole(見本)に失敗:", err);
        setWorkerSample({ console: [], timedOut: false, syntaxError: null, error: RUN_UNAVAILABLE });
      }
    })();
  }, [previewTab, isDom, samplePreview, composeSafely, solutionFiles]);

  // ---- 提出(§9.1: 合否問わず毎回 POST) ----
  const submitFetcher = useFetcher<ExerciseActionData>();
  const solutionFetcher = useFetcher<ExerciseActionData>();
  const [judging, setJudging] = useState(false);
  const [judgeError, setJudgeError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [clearResult, setClearResult] = useState<SubmitResult | null>(null);
  const [hintState, setHintState] = useState({
    unlockedHintCount: exercise.unlockedHintCount,
    solutionAvailable: exercise.solutionAvailable,
  });
  const [failedCount, setFailedCount] = useState(exercise.failedCount);
  const [toast, setToast] = useState<string | null>(null);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const verdictRef = useRef<Verdict | null>(null);
  verdictRef.current = verdict;

  const handleSubmit = useCallback(async () => {
    if (judging) return;
    setJudging(true);
    setJudgeError(null);
    let result: Verdict;
    try {
      result = await judge(lesson, files);
    } catch (err) {
      console.error("judge に失敗:", err);
      setJudging(false);
      setJudgeError(JUDGE_ERROR_MESSAGE);
      return;
    }
    setVerdict(result);
    setJudging(false);
    submitFetcher.submit(
      {
        intent: "submit",
        verdict: JSON.stringify({
          passed: result.passed,
          timedOut: result.timedOut,
          details: result.details,
        }),
        code: JSON.stringify(editableSubset(lessonFiles, files)),
      },
      { method: "post" },
    );
  }, [judging, lesson, lessonFiles, files, submitFetcher]);

  // 提出 action の応答処理(同じ data を二重処理しないよう ref でガード)
  const processedSubmitRef = useRef<ExerciseActionData | null>(null);
  useEffect(() => {
    if (submitFetcher.state !== "idle") return;
    const data = submitFetcher.data;
    if (data === undefined || processedSubmitRef.current === data) return;
    processedSubmitRef.current = data;
    if ("error" in data) {
      // 429(レート制限)や 5xx はトーストで通知(SPEC E §1)
      setToast(data.error);
      if (verdictRef.current?.passed === true) {
        // 記録に失敗しても合格演出は出す(progress サービス未接続時のフォールバック)
        setClearResult({
          passed: true,
          streak: null,
          newBadges: [],
          unlockedHintCount: 0,
          solutionAvailable: false,
        });
      }
      return;
    }
    if ("ok" in data) return;
    setHintState({ unlockedHintCount: data.unlockedHintCount, solutionAvailable: data.solutionAvailable });
    if (data.passed) {
      setClearResult(data);
    } else {
      setFailedCount((count) => count + 1);
    }
  }, [submitFetcher.state, submitFetcher.data]);

  useEffect(() => {
    if (solutionFetcher.state !== "idle") return;
    const data = solutionFetcher.data;
    if (data !== undefined && "error" in data) setToast(data.error);
  }, [solutionFetcher.state, solutionFetcher.data]);

  useEffect(() => {
    if (toast === null) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleReset() {
    if (!window.confirm("コードを最初の状態に戻します。下書きも削除されます。よろしいですか?")) return;
    clearDraft(window.localStorage, lessonSlug);
    lastChangedFileRef.current = null;
    setFiles(restoreFiles(lessonFiles, null));
  }

  function handleShowSolution() {
    if (!hintState.solutionAvailable) return;
    solutionFetcher.submit({ intent: "view-solution" }, { method: "post" });
    setSolutionOpen(true);
  }

  // ---- md 未満のタブ切替(§2.6) ----
  const [mobilePane, setMobilePane] = useState<MobilePane>("code");

  const submitBusy = judging || submitFetcher.state !== "idle";
  const judgeTone = judging
    ? "text-slate-600"
    : judgeError !== null
      ? "text-rose-600"
      : verdict === null
        ? "text-slate-500"
        : verdict.passed
          ? "text-emerald-600"
          : "text-rose-600";
  const judgeText = judging
    ? "判定中…"
    : (judgeError ??
      (verdict === null
        ? "「できた!」を押すと判定します"
        : verdict.passed
          ? "合格です! おめでとうございます"
          : failMessage(verdict)));

  // 中央セクションのエディタ + 実行バー(タブ表示 / ツリー表示の両レイアウトで共有)
  const editorAndRun = (
    <>
      <div className="min-h-0 flex-1 overflow-hidden bg-white">
        {activeMeta !== undefined ? (
          <CodeEditor
            fileName={activeFile}
            value={files[activeFile] ?? ""}
            readOnly={!activeMeta.editable}
            onChange={handleEditorChange}
            onRun={showRun ? triggerRun : undefined}
          />
        ) : (
          <p className="p-4 text-slate-500 text-sm">表示できるファイルがありません</p>
        )}
      </div>
      {showRun && (
        <div className="flex items-center gap-2 border-slate-200 border-t bg-white px-3 py-2">
          <button
            data-testid="run-button"
            type="button"
            onClick={triggerRun}
            disabled={running}
            className="rounded-xl bg-slate-800 px-4 py-1.5 font-medium text-sm text-white hover:bg-slate-700 disabled:opacity-60"
          >
            ▶ 実行
          </button>
          <span className="text-slate-400 text-xs">Ctrl / ⌘ + Enter でも実行できます</span>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-[calc(100dvh-53px)] min-h-0 flex-col bg-slate-50">
      {/* md 未満: 手順 / コード / プレビュー のタブ切替 */}
      <div
        role="tablist"
        aria-label="表示切替"
        className="flex gap-1 border-slate-200 border-b bg-white p-2 md:hidden"
      >
        {MOBILE_PANES.map((pane) => (
          <button
            key={pane.id}
            type="button"
            role="tab"
            aria-selected={mobilePane === pane.id}
            onClick={() => setMobilePane(pane.id)}
            className={clsx(
              "flex-1 rounded-lg px-3 py-1.5 text-sm",
              mobilePane === pane.id
                ? "bg-indigo-600 font-medium text-white"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {pane.label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* 左: 手順・ヒント */}
        <aside
          className={clsx(
            mobilePane === "guide" ? "flex" : "hidden",
            "min-h-0 w-full flex-col overflow-y-auto border-slate-200 md:flex md:w-80 md:shrink-0 md:border-r",
          )}
        >
          <GuidePanel
            lessonTitle={props.lessonTitle}
            estMinutes={lesson.meta.estMinutes}
            courseSlug={courseSlug}
            lessonSlug={lessonSlug}
            slideCount={props.slideCount}
            status={exercise.status}
            hints={lesson.hints}
            unlockedHintCount={hintState.unlockedHintCount}
            failedCount={failedCount}
            solutionAvailable={hintState.solutionAvailable}
          />
        </aside>

        {/* 中央: ファイルタブ(3ファイル以上の md+ はファイルツリー)+ エディタ + 実行 */}
        <section
          className={clsx(
            mobilePane === "code" ? "flex" : "hidden",
            "min-h-0 min-w-0 flex-1 border-slate-200 md:flex md:border-r",
            useFileTree ? "flex-row" : "flex-col",
          )}
        >
          {useFileTree ? (
            <>
              {/* md+: 左サイドのファイルツリーペイン。md 未満はツリーを隠しタブを表示(CSS のみで切替) */}
              <div className="hidden w-44 shrink-0 border-slate-200 border-r md:block">
                <FileTree files={visibleFiles} active={activeFile} onSelect={setActiveFile} />
              </div>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="md:hidden">
                  <FileTabs files={visibleFiles} active={activeFile} onSelect={setActiveFile} />
                </div>
                {editorAndRun}
              </div>
            </>
          ) : (
            <>
              <FileTabs files={visibleFiles} active={activeFile} onSelect={setActiveFile} />
              {editorAndRun}
            </>
          )}
        </section>

        {/* 右: プレビュー + 判定メッセージ(位置固定) */}
        <section
          className={clsx(
            mobilePane === "preview" ? "flex" : "hidden",
            "min-h-0 min-w-0 flex-1 flex-col md:flex",
          )}
        >
          <PreviewPane
            runner={lesson.meta.runner}
            activeTab={previewTab}
            onTabChange={setPreviewTab}
            resultPreview={resultPreview}
            samplePreview={samplePreview}
            workerResult={workerResult}
            workerSample={workerSample}
            runId={runId}
          />
          <div
            data-testid="judge-message"
            aria-live="polite"
            className={clsx("min-h-14 border-slate-200 border-t bg-white px-4 py-3 text-sm", judgeTone)}
          >
            {judging && (
              <span className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent align-middle motion-reduce:animate-none" />
            )}
            {judgeText}
          </div>
        </section>
      </div>

      {/* 下部バー: リセット / 答えを見る / できた! (§2.3) */}
      <div className="flex items-center justify-between gap-3 border-slate-200 border-t bg-white px-4 py-2.5">
        <button
          data-testid="reset-button"
          type="button"
          onClick={handleReset}
          className="rounded-xl border border-slate-300 px-4 py-2 text-slate-600 text-sm hover:bg-slate-100"
        >
          リセット
        </button>
        <div className="flex items-center gap-3">
          <button
            data-testid="show-solution"
            type="button"
            disabled={!hintState.solutionAvailable}
            onClick={handleShowSolution}
            className="rounded-xl border border-slate-300 px-4 py-2 text-slate-600 text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            答えを見る
          </button>
          <button
            data-testid="submit-button"
            type="button"
            disabled={submitBusy}
            onClick={() => {
              void handleSubmit();
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitBusy && <Spinner />}
            {submitBusy ? "判定中…" : "できた!"}
          </button>
        </div>
      </div>

      {toast !== null && (
        <div
          role="status"
          className="-translate-x-1/2 fixed bottom-20 left-1/2 z-50 flex items-center gap-3 rounded-xl bg-rose-600 px-4 py-2 text-sm text-white shadow-lg"
        >
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="underline">
            閉じる
          </button>
        </div>
      )}

      {clearResult !== null && (
        <ClearScreen
          result={clearResult}
          courseSlug={courseSlug}
          nextLessonSlug={props.nextLessonSlug}
          onContinue={() => setClearResult(null)}
        />
      )}

      {solutionOpen && <SolutionModal solution={lesson.solution} onClose={() => setSolutionOpen(false)} />}
    </div>
  );
}
