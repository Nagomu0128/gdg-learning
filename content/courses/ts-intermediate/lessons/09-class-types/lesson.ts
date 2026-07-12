import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-int-09-class-types",
  title: "クラスと型",
  estMinutes: 8,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// クラスには「型」を組み合わせられます。
//   ・implements で「このクラスが満たすべき形(interface)」を宣言できる
//   ・private / public でプロパティやメソッドの公開範囲を指定できる

// Counter は「このクラスが満たすべき形」です(すでに定義済み)。
interface Counter {
  increment(): void;
  current(): number;
}

// SimpleCounter を型付きで完成させよう。
//   1) この class が Counter を満たすことを宣言しよう(スライド参照)
//   2) count は外から書き換えられないように、公開範囲を指定して型を付けよう
//   3) increment と current は外から呼べるように、公開範囲を指定しよう
class SimpleCounter {
  count = 0;

  constructor(start) {
    // this.count = start; と書こう

  }

  increment() {
    // this.count を 1 増やそう

  }

  current() {
    // this.count を返そう

  }
}

// 動作確認・判定用(そのままでOK): SimpleCounter を使う関数
function countUp(start, times) {
  const counter = new SimpleCounter(start);
  for (let i = 0; i < times; i = i + 1) {
    counter.increment();
  }
  return counter.current();
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(countUp(0, 3));
console.log(countUp(10, 2));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "implements-interface",
      file: "script.ts",
      pattern: "class\\s+SimpleCounter\\s+implements\\s+Counter\\b",
      message:
        "SimpleCounter が Counter を満たすことを宣言しましょう(class SimpleCounter implements Counter の形)",
    },
    {
      type: "source",
      id: "private-field",
      file: "script.ts",
      pattern: "private\\s+count\\s*:\\s*number\\b",
      message:
        "count を外から書き換えられないようにしましょう(private count: number; の形。private は公開範囲の指定です)",
    },
    {
      type: "source",
      id: "public-method",
      file: "script.ts",
      pattern: "public\\s+increment\\s*\\(\\s*\\)\\s*:\\s*void\\b",
      message: "increment を外から呼べるメソッドにしましょう(public increment(): void の形)",
    },
    {
      type: "fn",
      id: "count-up-3",
      name: "countUp",
      args: [0, 3],
      returns: 3,
      message:
        "constructor で this.count = start、increment で 1 増やし、current で this.count を返すようにしましょう(0 から 3 回で 3)",
    },
    {
      type: "fn",
      id: "count-up-from-10",
      name: "countUp",
      args: [10, 2],
      returns: 12,
      message: "開始値が変わっても数えられるようにしましょう(10 から 2 回で 12)",
    },
    {
      type: "fn",
      id: "count-up-0",
      name: "countUp",
      args: [5, 0],
      returns: 5,
      message: "0 回のときは開始値のままにしましょう(5 から 0 回で 5)",
    },
  ],
  hints: [
    "class の名前のうしろに implements 型 と書くと、その形(interface)を満たすことを宣言できます。プロパティやメソッドの前に private / public を付けると公開範囲を指定できます",
    "class SimpleCounter implements Counter とし、private count: number; を宣言、constructor で this.count = start、public increment(): void と public current(): number を実装します",
    "constructor(start: number) { this.count = start; }、public increment(): void { this.count = this.count + 1; }、public current(): number { return this.count; } で完成です",
  ],
  solution: {
    "script.ts": `interface Counter {
  increment(): void;
  current(): number;
}

class SimpleCounter implements Counter {
  private count: number;

  constructor(start: number) {
    this.count = start;
  }

  public increment(): void {
    this.count = this.count + 1;
  }

  public current(): number {
    return this.count;
  }
}

function countUp(start: number, times: number): number {
  const counter = new SimpleCounter(start);
  for (let i = 0; i < times; i = i + 1) {
    counter.increment();
  }
  return counter.current();
}

console.log(countUp(0, 3));
console.log(countUp(10, 2));
`,
  },
});
