import { parse } from "acorn";
import { describe, expect, it } from "vitest";
import { LOOP_MAX_ITERATIONS } from "./limits";
import {
  instrumentLoops,
  LOOP_LIMIT_MESSAGE_JP,
  LOOP_PROTECT_ERROR_MESSAGE,
  type SyntaxDiag,
} from "./loop-protect";

function instrument(source: string, opts?: { maxIterations?: number }): string {
  const result = instrumentLoops(source, opts);
  if (!result.ok) throw new Error(`unexpected syntax error: ${result.error.message}`);
  return result.code;
}

/** 変換後コードを実行し、resultExpr の評価値を返す */
function run(source: string, resultExpr = "undefined", opts?: { maxIterations?: number }): unknown {
  const code = instrument(source, opts);
  return new Function(`${code}\n;return (${resultExpr});`)();
}

function instrumentError(source: string): SyntaxDiag {
  const result = instrumentLoops(source);
  if (result.ok) throw new Error("expected syntax error but instrumentation succeeded");
  return result.error;
}

describe("instrumentLoops — 無限ループの脱出", () => {
  it("while(true){} は既定 10 万回で throw する", () => {
    expect(() => run("while (true) {}")).toThrow(LOOP_PROTECT_ERROR_MESSAGE);
  });

  it("for(;;){} は throw する", () => {
    expect(() => run("for (;;) {}")).toThrow(LOOP_PROTECT_ERROR_MESSAGE);
  });

  it("do{}while(true) は throw する", () => {
    expect(() => run("do {} while (true)")).toThrow(LOOP_PROTECT_ERROR_MESSAGE);
  });

  it("for-of の無限イテレータは throw する", () => {
    const src = `
      const inf = { [Symbol.iterator]() { return { next() { return { value: 1, done: false }; } }; } };
      for (const x of inf) {}
    `;
    expect(() => run(src)).toThrow(LOOP_PROTECT_ERROR_MESSAGE);
  });

  it("for-in も上限を超えると throw する(maxIterations=2)", () => {
    const src = "for (const k in { a: 1, b: 2, c: 3, d: 4, e: 5 }) {}";
    expect(() => run(src, "undefined", { maxIterations: 2 })).toThrow(LOOP_PROTECT_ERROR_MESSAGE);
  });

  it("単文本体の while も throw する", () => {
    expect(() => run("let i = 0; while (true) i++;")).toThrow(LOOP_PROTECT_ERROR_MESSAGE);
  });

  it("空文本体(while(cond);)も throw する", () => {
    expect(() => run("let i = 0; while (++i) ;")).toThrow(LOOP_PROTECT_ERROR_MESSAGE);
  });

  it("continue だけの本体でもカウントされる", () => {
    expect(() => run("while (true) continue;")).toThrow(LOOP_PROTECT_ERROR_MESSAGE);
  });

  it("do-while の単文無限ループも throw する", () => {
    expect(() => run("let i = 0; do i++; while (true)")).toThrow(LOOP_PROTECT_ERROR_MESSAGE);
  });

  it("関数内の無限ループも呼び出し時に throw する", () => {
    expect(() => run("function f() { while (true) {} } f();")).toThrow(LOOP_PROTECT_ERROR_MESSAGE);
  });

  it("throw されるのは message が専用文字列の Error", () => {
    const result = run(
      `let msg = ""; let isError = false;
       try { while (true) {} } catch (e) { msg = e.message; isError = e instanceof Error; }`,
      "[msg, isError]",
    );
    expect(result).toEqual([LOOP_PROTECT_ERROR_MESSAGE, true]);
  });

  it("既定の上限はちょうど LOOP_MAX_ITERATIONS 回(本体は 10 万回まで実行される)", () => {
    const count = run("let c = 0; try { while (true) { c++; } } catch (e) {}", "c");
    expect(count).toBe(LOOP_MAX_ITERATIONS);
  });

  it("maxIterations ちょうどのループは throw しない", () => {
    const n = run("let n = 0; for (let i = 0; i < 5; i++) n++;", "n", { maxIterations: 5 });
    expect(n).toBe(5);
  });

  it("maxIterations + 1 回のループは throw する", () => {
    expect(() => run("for (let i = 0; i < 6; i++) {}", "undefined", { maxIterations: 5 })).toThrow(
      LOOP_PROTECT_ERROR_MESSAGE,
    );
  });
});

describe("instrumentLoops — 正常なループは影響を受けない", () => {
  it("for の合計計算", () => {
    expect(run("let n = 0; for (let i = 1; i <= 10; i++) n += i;", "n")).toBe(55);
  });

  it("while のカウントアップ", () => {
    expect(run("let i = 0; while (i < 3) { i++; }", "i")).toBe(3);
  });

  it("do-while の単文本体", () => {
    expect(run("let i = 0; do i++; while (i < 3);", "i")).toBe(3);
  });

  it("for-of で配列を連結", () => {
    expect(run('let s = ""; for (const c of ["a", "b", "c"]) s += c;', "s")).toBe("abc");
  });

  it("for-in でキーを収集", () => {
    expect(run("const keys = []; for (const k in { x: 1, y: 2 }) keys.push(k);", "keys")).toEqual(["x", "y"]);
  });

  it("ネストしたループ(3×3)", () => {
    expect(run("let n = 0; for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) n++; }", "n")).toBe(9);
  });

  it("カウンタはループ入場のたびにリセットされる(内側の総回数が上限超でも per-entry で判定)", () => {
    const src = `
      let total = 0;
      for (let i = 0; i < 3; i++) {
        let j = 0;
        while (j < 8) { j++; total++; }
      }
    `;
    // 内側 while の総回数は 24 > 10 だが、1 回の入場あたり 8 回なので throw しない
    expect(run(src, "total", { maxIterations: 10 })).toBe(24);
  });

  it("if の単文本体のループ", () => {
    expect(run("let n = 0; if (true) while (n < 3) n++; else n = 100;", "n")).toBe(3);
  });

  it("else 側の単文本体のループ", () => {
    expect(run("let n = 0; if (false) n = 100; else for (let i = 0; i < 2; i++) n++;", "n")).toBe(2);
  });

  it("ユーザーの __lc0 変数を壊さない", () => {
    expect(run("let __lc0 = 99; for (let i = 0; i < 2; i++) {}", "__lc0")).toBe(99);
  });

  it("var 宣言のループ変数はループ後も参照できる", () => {
    expect(run("for (var i = 0; i < 3; i++);", "i")).toBe(3);
  });

  it("関数内のループ(複数回呼び出しでもリセット)", () => {
    const src = `
      function f() { let n = 0; while (n < 2) n++; return n; }
      let total = 0;
      for (let i = 0; i < 3; i++) total += f();
    `;
    expect(run(src, "total", { maxIterations: 4 })).toBe(6);
  });

  it("switch の case 内のループ", () => {
    expect(run("let n = 0; switch (1) { case 1: while (n < 3) n++; break; }", "n")).toBe(3);
  });

  it("アロー関数内のループ", () => {
    expect(run("const f = () => { let n = 0; for (let i = 0; i < 3; i++) n++; return n; };", "f()")).toBe(3);
  });
});

describe("instrumentLoops — ラベル付きループ", () => {
  it("continue label の意味を保つ", () => {
    const src = `
      let hits = 0;
      outer: for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (j === 1) continue outer;
          hits++;
        }
      }
    `;
    expect(run(src, "hits")).toBe(5);
  });

  it("break label の意味を保つ", () => {
    const src = `
      let n = 0;
      outer: for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) { n++; if (n === 7) break outer; }
      }
    `;
    expect(run(src, "n")).toBe(7);
  });

  it("ラベル付き無限ループも throw する", () => {
    const src = "outer: while (true) { while (true) { continue outer; } }";
    expect(() => run(src)).toThrow(LOOP_PROTECT_ERROR_MESSAGE);
  });

  it("多重ラベルも動く", () => {
    const src = "let last = -1; a: b: for (let i = 0; i < 3; i++) { last = i; if (i === 1) break a; }";
    expect(run(src, "last")).toBe(1);
  });
});

describe("instrumentLoops — 変換結果の構文と非破壊性", () => {
  const PARSE_BATTERY = [
    "while (true) {}",
    "let i = 0; while (i < 3) i++;",
    "for (;;) break;",
    "do {} while (false)",
    "do f(); while (false)",
    "for (const x of []) {}",
    "for (const k in {}) {}",
    "outer: for (;;) { break outer; }",
    "a: b: while (false) { continue b; }",
    "if (true) while (false) {} else {}",
    "let n = 0; while (n < 1) n++; while (n < 2) n++;",
    "switch (1) { case 1: while (false) {} }",
    "const f = () => { for (let i = 0; i < 1; i++) {} };",
    "function g() { while (false) {} }",
    "while (false);",
    "for (var i = 0; i < 3; i++);",
    "while (false) while (false) while (false);",
    "do do ; while (false); while (false)",
  ];

  it.each(PARSE_BATTERY)("変換後も parse 可能: %s", (src) => {
    const code = instrument(src);
    expect(() => parse(code, { ecmaVersion: "latest" })).not.toThrow();
  });

  it("隣接するループの境界で構文が壊れない", () => {
    expect(run("let a = 0;while (a < 2) { a++; }while (a < 5) { a++; }", "a")).toBe(5);
  });

  it("カウンタ宣言と guard が注入される", () => {
    const code = instrument("while (true) {}");
    expect(code).toContain("let __lc0 = 0");
    expect(code).toContain(LOOP_PROTECT_ERROR_MESSAGE);
  });

  it("ループを含まないコードは無変換", () => {
    const src = "const x = 1;\nconsole.log(x);";
    expect(instrument(src)).toBe(src);
  });

  it("文字列リテラル内の while は変換されない", () => {
    const src = 'const s = "while(true){}";';
    expect(instrument(src)).toBe(src);
    expect(run(src, "s")).toBe("while(true){}");
  });

  it("テンプレートリテラル内の for は変換されない", () => {
    const src = "const s = `for(;;){}`;";
    expect(instrument(src)).toBe(src);
  });

  it("コメント内のループ構文は変換されない", () => {
    const src = "// while(true){}\nconst x = 2;";
    expect(instrument(src)).toBe(src);
    expect(run(src, "x")).toBe(2);
  });

  it("空のソースはそのまま返す", () => {
    expect(instrument("")).toBe("");
  });
});

describe("instrumentLoops — 構文エラー診断", () => {
  it("構文エラーは ok:false と行番号を返す", () => {
    const error = instrumentError("const x = ;");
    expect(error.line).toBe(1);
    expect(error.message).toContain("1行目に文法エラー");
  });

  it("複数行のソースでも正しい行番号を返す", () => {
    const error = instrumentError("const a = 1;\nconst b = 2;\nconst = 5;");
    expect(error.line).toBe(3);
    expect(error.message).toContain("3行目に文法エラー");
  });

  it("全角括弧の構文エラーは全角診断に差し替わる", () => {
    const error = instrumentError('console.log（"hi"）');
    expect(error).toEqual({
      line: 1,
      message: "1行目に全角の「（」が入っています。半角の「(」に直しましょう",
    });
  });

  it("全角波括弧も診断される", () => {
    const error = instrumentError("if (true) ｛");
    expect(error.message).toContain("全角の「｛」");
  });

  it("全角英字(ｌｅｔ)も診断される", () => {
    const error = instrumentError("ｌｅｔ x = 1");
    expect(error.message).toContain("全角の「ｌ」");
    expect(error.message).toContain("半角の「l」");
  });

  it("全角セミコロンも診断される", () => {
    const error = instrumentError("let x = 1；");
    expect(error.message).toContain("全角の「；」");
    expect(error.message).toContain("半角の「;」");
  });
});

describe("定数", () => {
  it("専用エラー文字列は契約どおり", () => {
    expect(LOOP_PROTECT_ERROR_MESSAGE).toBe("__LOOP_LIMIT_EXCEEDED__");
  });

  it("日本語メッセージは無限ループに言及する", () => {
    expect(LOOP_LIMIT_MESSAGE_JP).toContain("無限ループ");
  });
});
