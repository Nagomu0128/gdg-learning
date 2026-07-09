// STUB(E が実装): 演習画面(3ペイン + 提出 action)。CONTRACTS §6, §6.1, §7。
import type { Route } from "./+types/courses.$course.$lesson.exercise";

export default function ExercisePage({ params }: Route.ComponentProps) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-bold text-2xl text-slate-900">演習: {params.lesson}</h1>
      <p className="mt-4 text-slate-500 text-sm">TODO: 演習画面(担当: E)</p>
    </main>
  );
}
