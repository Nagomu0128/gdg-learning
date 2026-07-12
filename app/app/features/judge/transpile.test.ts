import { describe, expect, it } from "vitest";
import { loadTranspiler, needsTranspile, scriptLangOf } from "./transpile";

describe("scriptLangOf", () => {
  it("拡張子から言語種別を判定する", () => {
    expect(scriptLangOf("script.js")).toBe("js");
    expect(scriptLangOf("script.ts")).toBe("ts");
    expect(scriptLangOf("app.tsx")).toBe("tsx");
    expect(scriptLangOf("app.jsx")).toBe("jsx");
    expect(scriptLangOf("index.html")).toBeNull();
    expect(scriptLangOf("style.css")).toBeNull();
    expect(scriptLangOf("commands.sh")).toBeNull();
    expect(scriptLangOf("memo.txt")).toBeNull();
  });
});

describe("needsTranspile", () => {
  it("ts/tsx/jsx を含むときだけ true", () => {
    expect(needsTranspile({ "index.html": "", "script.js": "" })).toBe(false);
    expect(needsTranspile({ "script.ts": "" })).toBe(true);
    expect(needsTranspile({ "index.html": "", "app.jsx": "" })).toBe(true);
    expect(needsTranspile({ "app.tsx": "" })).toBe(true);
  });
});

describe("loadTranspiler(sucrase)", () => {
  it("TS の型注釈を落として行番号を保存する", async () => {
    const transpile = await loadTranspiler();
    const result = transpile("let a: string = 'x';\nlet b: number = 1;\nconsole.log(a, b);", "ts");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.code).not.toContain(": string");
      expect(result.code).not.toContain(": number");
      // sucrase は行番号を保存する(診断の行ずれ防止)
      expect(result.code.split("\n")).toHaveLength(3);
    }
  });

  it("JSX を classic runtime(React.createElement)へ変換する", async () => {
    const transpile = await loadTranspiler();
    const result = transpile("function Hello() { return <h1>hi</h1>; }", "jsx");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.code).toContain("React.createElement");
      expect(result.code).not.toContain("jsxRuntime");
    }
  });

  it("TSX は型注釈と JSX の両方を処理する", async () => {
    const transpile = await loadTranspiler();
    const result = transpile("const n: number = 1;\nconst el = <p>{n}</p>;", "tsx");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.code).not.toContain(": number");
      expect(result.code).toContain("React.createElement");
    }
  });

  it("フラグメントは React.Fragment になる", async () => {
    const transpile = await loadTranspiler();
    const result = transpile("const el = <><p>a</p></>;", "jsx");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.code).toContain("React.Fragment");
  });

  it("構文エラーは行番号つき SyntaxDiag になる", async () => {
    const transpile = await loadTranspiler();
    const result = transpile("let a = 1;\nlet b = ;", "ts");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.line).toBe(2);
      expect(result.error.message).toContain("2行目");
    }
  });

  it("全角記号による構文エラーは全角診断メッセージになる", async () => {
    const transpile = await loadTranspiler();
    const result = transpile("let a = 1;\nlet b = (1 + 2)；", "ts");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("全角");
    }
  });
});
