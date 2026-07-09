// コース進捗バー(閲覧系ページ共用)。~/components/ui は C が並行実装中のため素の Tailwind で書く。

export function CourseProgressBar({
  passed,
  total,
  testId,
}: {
  passed: number;
  total: number;
  testId?: string;
}) {
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  return (
    <div data-testid={testId}>
      <div className="flex items-center justify-between text-slate-500 text-xs">
        <span>進捗</span>
        <span>
          {passed} / {total}
        </span>
      </div>
      <div
        className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label="コース進捗"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={passed}
      >
        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
