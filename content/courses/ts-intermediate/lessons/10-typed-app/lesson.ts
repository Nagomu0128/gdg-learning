import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-int-10-typed-app",
  title: "総合: 型で設計する",
  estMinutes: 10,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// 総合演習です。これまでに学んだ
//   リテラルのユニオン型 / interface / ジェネリクスの制約 / 配列の型
// を組み合わせて、小さな「タスク管理」の型と関数を完成させます。

// 1) Priority 型: 3つのレベルのどれか、というリテラルのユニオン型をここに定義しよう。
//    値は low / mid / high の3つ(それぞれ文字列リテラル)。


// 2) interface Task をここに定義しよう。
//    id は number、title は string、priority は Priority。


// 3) findById: id を持つオブジェクトの配列から、id が一致するものを返す(なければ undefined)。
//    型変数に「数値の id を持つ」制約を付け、items はその配列にしよう。
function findById(items, id) {
  // items.find((item) => item.id === id) を返そう

}

// 4) priorityScore: priority に応じて high なら 3 / mid なら 2 / low なら 1 を返そう。
//    引数 priority の型は Priority。
function priorityScore(priority) {
  // if で3つに分けて数値を返そう

}

// 5) totalScore: Task の配列を受け取り、priorityScore の合計を返そう。
//    引数 tasks の型は Task の配列。
function totalScore(tasks) {
  // それぞれの priority を priorityScore で数値にして合計しよう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(priorityScore("high"));
console.log(findById([{ id: 1, title: "買い物", priority: "low" }, { id: 2, title: "掃除", priority: "high" }], 2));
console.log(totalScore([{ id: 1, title: "買い物", priority: "low" }, { id: 2, title: "掃除", priority: "high" }]));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "define-priority",
      file: "script.ts",
      pattern: "type\\s+Priority\\s*=\\s*[\"']low[\"']\\s*\\|\\s*[\"']mid[\"']\\s*\\|\\s*[\"']high[\"']",
      message: 'リテラルのユニオン型を定義しましょう(type Priority = "low" | "mid" | "high"; の形)',
    },
    {
      type: "source",
      id: "define-task",
      file: "script.ts",
      pattern:
        "interface\\s+Task\\s*\\{(?=[^}]*\\bid\\s*:\\s*number\\b)(?=[^}]*\\btitle\\s*:\\s*string\\b)(?=[^}]*\\bpriority\\s*:\\s*Priority\\b)",
      message: "interface Task に id: number、title: string、priority: Priority の3つを定義しましょう",
    },
    {
      type: "source",
      id: "generic-constraint",
      file: "script.ts",
      pattern: "<\\s*T\\s+extends\\s*\\{\\s*id\\s*:\\s*number\\s*\\}\\s*>",
      message: "findById に制約付きの型変数を付けましょう(<T extends { id: number }> の形)",
    },
    {
      type: "source",
      id: "task-array-param",
      file: "script.ts",
      pattern: "tasks\\s*:\\s*Task\\s*\\[\\s*\\]",
      message: "totalScore の引数 tasks を Task の配列にしましょう(tasks: Task[] の形)",
    },
    {
      type: "fn",
      id: "priority-score",
      name: "priorityScore",
      args: ["high"],
      returns: 3,
      message: "priorityScore は high なら 3、mid なら 2、low なら 1 を返すようにしましょう",
    },
    {
      type: "fn",
      id: "find-by-id",
      name: "findById",
      args: [
        [
          { id: 1, title: "買い物", priority: "low" },
          { id: 2, title: "掃除", priority: "high" },
        ],
        2,
      ],
      returns: { id: 2, title: "掃除", priority: "high" },
      message: "findById は id が一致する要素を返すようにしましょう(items.find を使います)",
    },
    {
      type: "fn",
      id: "total-score",
      name: "totalScore",
      args: [
        [
          { id: 1, title: "買い物", priority: "low" },
          { id: 2, title: "掃除", priority: "high" },
        ],
      ],
      returns: 4,
      message: "totalScore は各 priority を priorityScore で数値にして合計しましょう(low 1 + high 3 = 4)",
    },
  ],
  hints: [
    "4つの道具を組み合わせます。Priority はリテラルのユニオン型、Task は interface、findById は <T extends { id: number }> の制約付きジェネリクス、totalScore は Task[] を受け取ります",
    'type Priority = "low" | "mid" | "high"; と interface Task { id: number; title: string; priority: Priority } を定義し、各関数に型を付けます。priorityScore は if で3分岐、totalScore は for で合計します',
    "findById<T extends { id: number }>(items: T[], id: number): T | undefined { return items.find((item) => item.id === id); }、totalScore(tasks: Task[]): number では sum に priorityScore(task.priority) を足していきます",
  ],
  solution: {
    "script.ts": `type Priority = "low" | "mid" | "high";

interface Task {
  id: number;
  title: string;
  priority: Priority;
}

function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

function priorityScore(priority: Priority): number {
  if (priority === "high") return 3;
  if (priority === "mid") return 2;
  return 1;
}

function totalScore(tasks: Task[]): number {
  let sum = 0;
  for (const task of tasks) {
    sum = sum + priorityScore(task.priority);
  }
  return sum;
}

console.log(priorityScore("high"));
console.log(findById([{ id: 1, title: "買い物", priority: "low" }, { id: 2, title: "掃除", priority: "high" }], 2));
console.log(totalScore([{ id: 1, title: "買い物", priority: "low" }, { id: 2, title: "掃除", priority: "high" }]));
`,
  },
});
