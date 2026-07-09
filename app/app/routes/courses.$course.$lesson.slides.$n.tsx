// 解説スライド(紙芝居)ルート(D 所有。DesignDoc §2.1, §2.2 / CONTRACTS §6 / SPEC D §4)。
// 未ログインでも閲覧可(進捗保存なし — CONTRACTS §6.1)。
import { MDXProvider } from "@mdx-js/react";
import { type ComponentType, useEffect, useState } from "react";
import { Link, redirect, useNavigate } from "react-router";
import { type ContentMeta, findLessonSlideContext } from "~/features/slides/content-meta";
import { slideMdxComponents } from "~/features/slides/mdx-components";
import contentMetaJson from "~/generated/content-meta.json";
// .client モジュール: サーバーでは undefined になるため、呼び出しは useEffect 内(クライアント)に限る
import { loadSlide } from "~/generated/slides.client";
import { SITE_NAME } from "~/lib/site";
import type { Route } from "./+types/courses.$course.$lesson.slides.$n";

export function loader({ params }: Route.LoaderArgs) {
  const found = findLessonSlideContext(
    contentMetaJson as unknown as ContentMeta,
    params.course,
    params.lesson,
  );
  if (!found) {
    throw new Response("Not Found", { status: 404 });
  }
  const { course, lesson, prevLessonSlug } = found;
  const slideCount = lesson.slideCount;

  // $n は 1..slideCount に正規化。範囲外・非数値は 404 ではなく端へ redirect(SPEC D §4)
  const slideUrl = (k: number) => `/courses/${course.slug}/${lesson.slug}/slides/${k}`;
  if (!/^\d+$/.test(params.n)) {
    throw redirect(slideUrl(1));
  }
  const n = Number(params.n);
  if (n < 1) throw redirect(slideUrl(1));
  if (n > slideCount) throw redirect(slideUrl(slideCount));
  if (String(n) !== params.n) throw redirect(slideUrl(n)); // "01" 等の非正規表記

  return {
    courseSlug: course.slug,
    courseTitle: course.title,
    lessonSlug: lesson.slug,
    lessonTitle: lesson.title,
    n,
    slideCount,
    prevLessonSlug,
    isLastSlide: n === slideCount,
  };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: SITE_NAME }];
  return [{ title: `${data.lessonTitle} スライド ${data.n}/${data.slideCount} | ${SITE_NAME}` }];
}

type SlideState =
  | { key: string; status: "loaded"; Component: ComponentType }
  | { key: string; status: "error" };

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export default function SlidePage({ loaderData }: Route.ComponentProps) {
  const { courseSlug, courseTitle, lessonSlug, lessonTitle, n, slideCount, isLastSlide } = loaderData;
  const navigate = useNavigate();

  const slideKey = `${lessonSlug}/${n}`;
  const [slide, setSlide] = useState<SlideState | null>(null);

  const prevTo = n > 1 ? `/courses/${courseSlug}/${lessonSlug}/slides/${n - 1}` : `/courses/${courseSlug}`;
  const nextTo = isLastSlide
    ? `/courses/${courseSlug}/${lessonSlug}/exercise`
    : `/courses/${courseSlug}/${lessonSlug}/slides/${n + 1}`;

  // スライド本文の遅延ロード(レッスン単位チャンク — §10.1)
  useEffect(() => {
    let cancelled = false;
    loadSlide(lessonSlug, n)
      .then((mod) => {
        if (!cancelled) setSlide({ key: slideKey, status: "loaded", Component: mod.default });
      })
      .catch(() => {
        if (!cancelled) setSlide({ key: slideKey, status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [lessonSlug, n, slideKey]);

  // 次スライドのプリフェッチ(§2.1)
  useEffect(() => {
    if (!isLastSlide) {
      loadSlide(lessonSlug, n + 1).catch(() => {});
    }
  }, [lessonSlug, n, isLastSlide]);

  // キーボード ← →(§10.5)。input 系にフォーカスがある時は無視
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigate(prevTo);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigate(nextTo);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, prevTo, nextTo]);

  const current = slide?.key === slideKey ? slide : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      {/* パンくず(コース名 → レッスン名)+ スライド位置 */}
      <nav aria-label="パンくず" className="flex items-center gap-2 text-slate-500 text-sm">
        <Link to={`/courses/${courseSlug}`} className="hover:text-indigo-600 hover:underline">
          {courseTitle}
        </Link>
        <span aria-hidden="true">›</span>
        <span className="font-medium text-slate-700">{lessonTitle}</span>
        <span className="ml-auto tabular-nums">
          スライド {n} / {slideCount}
        </span>
      </nav>

      {/* 紙芝居カード */}
      <section
        aria-label={`スライド ${n}`}
        className="mt-4 min-h-[24rem] rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        {current === null && <SlideSkeleton />}
        {current?.status === "error" && (
          <p className="text-slate-600">
            スライドを読み込めませんでした。ページを再読み込みしてもう一度お試しください。
          </p>
        )}
        {current?.status === "loaded" && (
          <MDXProvider components={slideMdxComponents}>
            <current.Component />
          </MDXProvider>
        )}
      </section>

      {/* 下部ナビゲーション: 前へ / 進捗ドット / 次へ(1枚目の「前へ」はレッスン一覧へ) */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <Link
          to={prevTo}
          prefetch="intent"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 text-sm hover:bg-slate-100"
        >
          {n > 1 ? "← 前へ" : "← レッスン一覧へ"}
        </Link>

        <div className="flex items-center gap-2" aria-hidden="true">
          {Array.from({ length: slideCount }, (_, i) => i + 1).map((k) => (
            <Link
              key={k}
              to={`/courses/${courseSlug}/${lessonSlug}/slides/${k}`}
              tabIndex={-1}
              className={
                k === n
                  ? "h-2.5 w-2.5 rounded-full bg-indigo-600"
                  : "h-2.5 w-2.5 rounded-full bg-slate-300 hover:bg-slate-400"
              }
            />
          ))}
        </div>

        <Link
          to={nextTo}
          prefetch="intent"
          className={
            isLastSlide
              ? "rounded-lg bg-emerald-600 px-4 py-2 font-medium text-sm text-white hover:bg-emerald-700"
              : "rounded-lg bg-indigo-600 px-4 py-2 font-medium text-sm text-white hover:bg-indigo-700"
          }
        >
          {isLastSlide ? "演習へすすむ →" : "次へ →"}
        </Link>
      </div>

      <p className="mt-3 text-center text-slate-400 text-xs">キーボードの ← → でも移動できます</p>
    </main>
  );
}

function SlideSkeleton() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="読み込み中">
      <div className="h-8 w-2/3 rounded bg-slate-200" />
      <div className="h-5 w-full rounded bg-slate-100" />
      <div className="h-5 w-5/6 rounded bg-slate-100" />
      <div className="h-32 w-full rounded-xl bg-slate-100" />
    </div>
  );
}
