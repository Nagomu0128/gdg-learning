// STUB(F が実装): レッスン一覧 + 進捗バー。CONTRACTS §6。
import type { Route } from "./+types/courses.$course";

export default function CourseDetailPage({ params }: Route.ComponentProps) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-bold text-2xl text-slate-900">コース: {params.course}</h1>
      <p className="mt-4 text-slate-500 text-sm">TODO: レッスン一覧 + 進捗バー(担当: F)</p>
    </main>
  );
}
