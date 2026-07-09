// 演習ルート(CONTRACTS §6, §6.1, §7 / SPEC E §1)。
// loader: requireUser + content-meta + ExerciseState。action: intent=submit / view-solution。
// クライアント: lesson データ(judgeBundle 含む)と画面本体(CodeMirror)は遅延ロードし SSR に載せない。
import { lazy, Suspense, useEffect, useState } from "react";
import { data } from "react-router";
import { z } from "zod";
import { requireUser } from "~/features/auth/auth.server";
import type { ExerciseActionData } from "~/features/exercise/types";
import { getExerciseState, markSolutionViewed, submitVerdict } from "~/features/progress/index.server";
import type { ExerciseState } from "~/features/progress/types";
import contentMetaJson from "~/generated/content-meta.json";
import { type LoadedLesson, loadLesson } from "~/generated/lessons.client";
import type { Route } from "./+types/courses.$course.$lesson.exercise";

// ---- content-meta.json(CONTRACTS §3.1。loader で使う最小限の形) ----
type ContentMeta = {
  contentVersion: string;
  courses: {
    slug: string;
    title: string;
    lessons: { slug: string; title: string; slideCount: number }[];
  }[];
};

const contentMeta = contentMetaJson as unknown as ContentMeta;

function findLesson(courseSlug: string, lessonSlug: string) {
  const courses = Array.isArray(contentMeta.courses) ? contentMeta.courses : [];
  const course = courses.find((c) => c.slug === courseSlug);
  if (course === undefined) return null;
  const index = course.lessons.findIndex((l) => l.slug === lessonSlug);
  const lesson = index === -1 ? undefined : course.lessons[index];
  if (lesson === undefined) return null;
  return { lesson, nextLessonSlug: course.lessons[index + 1]?.slug ?? null };
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const user = await requireUser(request, env);
  const found = findLesson(params.course, params.lesson);
  if (found === null) throw data("レッスンが見つかりません", { status: 404 });

  let exercise: ExerciseState;
  try {
    exercise = await getExerciseState(env, user.id, found.lesson.slug);
  } catch (err) {
    // progress サービス未接続(スタブ)でも画面を開けるようにするフォールバック
    console.error("getExerciseState に失敗:", err);
    exercise = {
      status: "not_started",
      failedCount: 0,
      unlockedHintCount: 0,
      solutionAvailable: false,
      solutionViewed: false,
    };
  }

  return {
    user,
    courseSlug: params.course,
    lessonSlug: found.lesson.slug,
    lessonTitle: found.lesson.title,
    exercise,
    nextLessonSlug: found.nextLessonSlug,
    slideCount: found.lesson.slideCount,
  };
}

// ---- action(CONTRACTS §6.1。verdict の再検証はしない — ADR #5) ----
const verdictPayloadSchema = z.object({
  passed: z.boolean(),
  timedOut: z.boolean(),
  details: z.array(z.object({ checkId: z.string(), passed: z.boolean() })),
});
const fileMapSchema = z.record(z.string(), z.string());

function parseJsonField(raw: FormDataEntryValue | null): unknown {
  if (typeof raw !== "string") return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const env = context.cloudflare.env;
  const user = await requireUser(request, env);
  if (findLesson(params.course, params.lesson) === null) {
    throw data("レッスンが見つかりません", { status: 404 });
  }
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "view-solution") {
    try {
      await markSolutionViewed(env, user.id, params.lesson);
    } catch (err) {
      // 閲覧記録(学習分析用)の失敗で学習体験は止めない
      console.error("markSolutionViewed に失敗:", err);
    }
    return { ok: true as const };
  }

  if (intent === "submit") {
    const verdictParsed = verdictPayloadSchema.safeParse(parseJsonField(form.get("verdict")));
    const codeParsed = fileMapSchema.safeParse(parseJsonField(form.get("code")));
    if (!verdictParsed.success || !codeParsed.success) {
      return data({ error: "提出データが不正です" }, { status: 400 });
    }
    try {
      return await submitVerdict(env, user.id, {
        lessonSlug: params.lesson,
        verdict: verdictParsed.data,
        code: codeParsed.data,
      });
    } catch (err) {
      // レート制限(429)等の Response throw はそのまま返す(SPEC E §1)
      if (err instanceof Response) return err;
      console.error("submitVerdict に失敗:", err);
      return data({ error: "提出の保存に失敗しました。時間をおいて再度お試しください" }, { status: 500 });
    }
  }

  return data({ error: "不正なリクエストです" }, { status: 400 });
}

// ---- クライアント(CodeMirror・judgeBundle は SSR に載せない) ----
const ExerciseScreen = lazy(() => import("~/features/exercise/exercise-screen"));

function ExerciseFallback(props: { title: string; message?: string }) {
  return (
    <main className="flex h-[calc(100dvh-53px)] items-center justify-center p-8">
      <div className="text-center">
        <h1 className="font-bold text-lg text-slate-900">{props.title}</h1>
        <p className="mt-2 text-slate-500 text-sm">{props.message ?? "演習を読み込んでいます…"}</p>
      </div>
    </main>
  );
}

export default function ExercisePage({ loaderData }: Route.ComponentProps) {
  const [lesson, setLesson] = useState<LoadedLesson | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLesson(null);
    setLoadError(false);
    void (async () => {
      try {
        const loaded = await loadLesson(loaderData.lessonSlug);
        if (!cancelled) setLesson(loaded);
      } catch (err) {
        // codegen 未実行(スタブ)や未知 slug では throw する(CONTRACTS §3.1)
        console.error("loadLesson に失敗:", err);
        if (!cancelled) setLoadError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loaderData.lessonSlug]);

  if (loadError) {
    return (
      <ExerciseFallback
        title={loaderData.lessonTitle}
        message="教材データの読み込みに失敗しました。教材ビルド(codegen)が未完了の可能性があります"
      />
    );
  }
  if (lesson === null) {
    return <ExerciseFallback title={loaderData.lessonTitle} />;
  }
  return (
    <Suspense fallback={<ExerciseFallback title={loaderData.lessonTitle} />}>
      <ExerciseScreen
        lesson={lesson}
        courseSlug={loaderData.courseSlug}
        lessonTitle={loaderData.lessonTitle}
        exercise={loaderData.exercise}
        nextLessonSlug={loaderData.nextLessonSlug}
        slideCount={loaderData.slideCount}
      />
    </Suspense>
  );
}

// ExerciseActionData(features/exercise/types.ts)と action の応答形を一致させるための型注釈。
// 変更時に型エラーで乖離を検出する。
type _ActionShapeCheck =
  Awaited<ReturnType<typeof action>> extends
    | ExerciseActionData
    | Response
    | ReturnType<typeof data<{ error: string }>>
    ? true
    : never;
const _actionShapeCheck: _ActionShapeCheck = true;
void _actionShapeCheck;
