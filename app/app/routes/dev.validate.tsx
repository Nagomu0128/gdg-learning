// 教材 自己整合性検証ページ(DesignDoc §4.4 ステージ2、CONTRACTS §8、SPEC B §5)。
// 各レッスンの solution を本物の判定パイプラインに通し、全 checks 合格を確認する。
// env.DEV_LOGIN === "1" 以外は 404。K の Playwright が data-testid="validate-summary" を assert する。

import type { FileMap } from "@codesteps/lesson-kit";
import { useEffect, useRef, useState } from "react";
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

export function loader({ context }: Route.LoaderArgs) {
  if (context.cloudflare.env.DEV_LOGIN !== "1") {
    throw new Response("Not Found", { status: 404 });
  }
  return null;
}

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

export default function DevValidate() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [done, setDone] = useState(false);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    const update = (slug: string, patch: Partial<Row>): void => {
      setRows((prev) => prev.map((row) => (row.slug === slug ? { ...row, ...patch } : row)));
    };
    void (async () => {
      for (const row of initialRows()) {
        update(row.slug, { status: "running" });
        try {
          const lesson = await loadLesson(row.slug);
          const files: FileMap = {};
          for (const [name, file] of Object.entries(lesson.files)) {
            files[name] = file.initial;
          }
          Object.assign(files, lesson.solution);
          const verdict = await judge(lesson, files);
          if (verdict.passed) {
            update(row.slug, { status: "pass", message: null });
          } else {
            update(row.slug, {
              status: "fail",
              message: verdict.display?.message ?? (verdict.timedOut ? "タイムアウト" : "不明な失敗"),
            });
          }
        } catch (e) {
          update(row.slug, { status: "fail", message: e instanceof Error ? e.message : String(e) });
        }
      }
      setDone(true);
    })();
  }, []);

  const total = rows.length;
  const passCount = rows.filter((r) => r.status === "pass").length;
  const failures = rows.filter((r) => r.status === "fail");

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-bold text-2xl text-slate-900">教材 自己整合性検証</h1>
      <p className="mt-2 text-slate-500 text-sm">
        contentVersion: {contentMeta.contentVersion} / 各レッスンの solution を判定エンジンに通します
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
