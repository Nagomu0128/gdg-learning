// 教材 自己整合性検証ページ(DesignDoc §4.4 ステージ2、CONTRACTS §8、SPEC B §5、J-judge-hardening)。
// 各レッスンを本物の判定パイプラインに 2 回通す:
//   ① solution は全 checks に合格すること(お手本が合格条件を満たす)
//   ② initial(手つかずの初期コード)は不合格になること(initial のまま合格 = check に穴)
// env.DEV_LOGIN === "1" 以外は 404。K の Playwright が data-testid="validate-summary" を assert する。

import type { FileMap } from "@codesteps/lesson-kit";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { judge } from "~/features/judge";
import contentMetaJson from "~/generated/content-meta.json";
import { loadLesson } from "~/generated/lessons.client";
import type { Route } from "./+types/dev.validate";

type ContentMeta = {
  contentVersion: string;
  courses: {
    slug: string;
    title: string;
    lessons: { slug: string; title: string; runner: "dom" | "worker" }[];
  }[];
};

const contentMeta = contentMetaJson as unknown as ContentMeta;

/**
 * 同時に走らせる判定の数。1 レッスン内は solution → initial の直列。
 * 判定 iframe / Worker は nonce で分離されており並行安全(dom-runner の受理 3 条件)。
 * 上げすぎると CI の CPU 競合で個々の判定が 5000ms タイムアウトに近づくため控えめにする。
 */
const JUDGE_CONCURRENCY = 2;

export function loader({ context }: Route.LoaderArgs) {
  if (context.cloudflare.env.DEV_LOGIN !== "1") {
    throw new Response("Not Found", { status: 404 });
  }
  return null;
}

type Variant = "both" | "solution" | "initial";
type RowStatus = "pending" | "running" | "pass" | "fail";
type Row = { slug: string; title: string; status: RowStatus; message: string | null };

function initialRows(): Row[] {
  return contentMeta.courses.flatMap((course) =>
    course.lessons.map((lesson) => ({
      slug: lesson.slug,
      title: lesson.title,
      status: "pending" as RowStatus,
      message: null,
    })),
  );
}

/** 1 レッスンの検証。失敗理由(なければ null)を返す */
async function validateLesson(slug: string, variant: Variant): Promise<string | null> {
  const lesson = await loadLesson(slug);
  const initialFiles: FileMap = {};
  for (const [name, file] of Object.entries(lesson.files)) {
    initialFiles[name] = file.initial;
  }

  if (variant !== "initial") {
    const solutionFiles: FileMap = { ...initialFiles, ...lesson.solution };
    const verdict = await judge(lesson, solutionFiles);
    if (!verdict.passed) {
      const reason = verdict.display?.message ?? (verdict.timedOut ? "タイムアウト" : "不明な失敗");
      return `solution が不合格: ${reason}`;
    }
  }

  if (variant !== "solution") {
    const verdict = await judge(lesson, { ...initialFiles });
    if (verdict.passed) {
      return "initial のままで合格してしまいます(check に穴があります)";
    }
  }

  return null;
}

export default function DevValidate() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [done, setDone] = useState(false);
  const ranRef = useRef(false);
  const [searchParams] = useSearchParams();
  const variantParam = searchParams.get("variant");
  const variant: Variant = variantParam === "solution" || variantParam === "initial" ? variantParam : "both";

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    const update = (slug: string, patch: Partial<Row>): void => {
      setRows((prev) => prev.map((row) => (row.slug === slug ? { ...row, ...patch } : row)));
    };
    void (async () => {
      const queue = initialRows();
      let next = 0;
      const worker = async (): Promise<void> => {
        while (next < queue.length) {
          const row = queue[next];
          next += 1;
          if (row === undefined) break;
          update(row.slug, { status: "running" });
          try {
            const failure = await validateLesson(row.slug, variant);
            if (failure === null) {
              update(row.slug, { status: "pass", message: null });
            } else {
              update(row.slug, { status: "fail", message: failure });
            }
          } catch (e) {
            update(row.slug, { status: "fail", message: e instanceof Error ? e.message : String(e) });
          }
        }
      };
      await Promise.all(Array.from({ length: JUDGE_CONCURRENCY }, () => worker()));
      setDone(true);
    })();
  }, [variant]);

  const total = rows.length;
  const passCount = rows.filter((r) => r.status === "pass").length;
  const failures = rows.filter((r) => r.status === "fail");

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-bold text-2xl text-slate-900">教材 自己整合性検証</h1>
      <p className="mt-2 text-slate-500 text-sm">
        contentVersion: {contentMeta.contentVersion} / solution は合格・initial は不合格になることを検証します
        {variant !== "both" && `(variant: ${variant} のみ)`}
      </p>

      {done ? (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 font-bold ${
            failures.length === 0
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-rose-300 bg-rose-50 text-rose-700"
          }`}
          data-testid="validate-summary"
        >
          {failures.length === 0 ? `PASS ${passCount}/${total}` : `FAIL ${failures.length}/${total}`}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-600">
          検証中… {passCount + failures.length}/{total}
        </div>
      )}

      {failures.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm" data-testid="validate-failures">
          {failures.map((row) => (
            <li key={row.slug} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
              <span className="font-mono font-semibold text-rose-700">{row.slug}</span>
              <span className="ml-2 text-rose-600">{row.message}</span>
            </li>
          ))}
        </ul>
      )}

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-slate-200 border-b text-left text-slate-500">
            <th className="py-1 pr-4 font-medium">レッスン</th>
            <th className="py-1 pr-4 font-medium">タイトル</th>
            <th className="py-1 font-medium">結果</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slug} className="border-slate-100 border-b">
              <td className="py-1 pr-4 font-mono">{row.slug}</td>
              <td className="py-1 pr-4">{row.title}</td>
              <td className="py-1">
                {row.status === "pass" && <span className="text-emerald-600">合格</span>}
                {row.status === "fail" && <span className="text-rose-600">失敗</span>}
                {row.status === "running" && <span className="text-indigo-600">判定中…</span>}
                {row.status === "pending" && <span className="text-slate-400">待機</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
