// STUB(D が実装): 解説スライド(紙芝居)。CONTRACTS §6。
import type { Route } from "./+types/courses.$course.$lesson.slides.$n";

export default function SlidePage({ params }: Route.ComponentProps) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-bold text-2xl text-slate-900">
        スライド {params.n}: {params.lesson}
      </h1>
      <p className="mt-4 text-slate-500 text-sm">TODO: スライド表示(担当: D)</p>
    </main>
  );
}
