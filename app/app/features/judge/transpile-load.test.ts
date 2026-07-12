// loadTranspiler の dynamic import 失敗からの回復(transpile.ts の .catch)。
// sucrase のロードが一度 reject しても loading を解放し、次回呼び出しで再試行できることを検証する。
// sucrase を vi.doMock で差し替えるため、実 sucrase を使う transpile.test.ts とは別ファイルに分離する
//(vitest は test ファイル単位でモジュールを隔離する)。
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.doUnmock("sucrase");
  vi.resetModules();
});

describe("loadTranspiler の dynamic import 失敗からの回復", () => {
  it("1回目の失敗後に loading を解放し、2回目の呼び出しで解決する", async () => {
    let attempt = 0;
    // 1回目だけ、名前空間の transform を読む瞬間に throw させる(チャンク404・ネットワーク断の再現)。
    // loadTranspiler は import().then(({ transform }) => …) で分割代入するため、
    // この読取りが throw すると Promise チェーンが reject し .catch に入る。
    // (factory 自体を throw させると vitest がモック設定エラーで包むため getter で失敗させる)
    vi.doMock("sucrase", () => ({
      get transform() {
        attempt += 1;
        if (attempt === 1) throw new Error("Failed to fetch dynamically imported module: sucrase");
        return (source: string) => ({ code: source.replace(/:\s*\w+/g, "") });
      },
    }));
    vi.resetModules();
    const { loadTranspiler } = await import("./transpile");

    // 1回目: sucrase のロードが reject → loadTranspiler も同じエラーで reject
    await expect(loadTranspiler()).rejects.toThrow(/Failed to fetch/);
    expect(attempt).toBe(1);

    // 2回目の loadTranspiler() は .catch で loading が null に戻っているため
    // import("sucrase") を再実行できる(バグ = catch 無しなら loading が rejected のまま
    // 保持され、この呼び出しも reject して attempt が 1 のまま)。
    // vi.resetModules() は sucrase モックのモジュールキャッシュを落として再評価させるため
    // (transpile.ts 側の loading リセット自体は .catch が担う。本テストの検証対象)。
    vi.resetModules();
    const transpile = await loadTranspiler();
    expect(attempt).toBe(2);

    const result = transpile("const n: number = 1;", "ts");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.code).not.toContain(": number");
  });

  it("解決後はメモ化され、再度ロードせず同じトランスパイラを返す", async () => {
    let loads = 0;
    vi.doMock("sucrase", () => ({
      get transform() {
        loads += 1;
        return (source: string) => ({ code: source });
      },
    }));
    vi.resetModules();
    const { loadTranspiler } = await import("./transpile");

    const first = await loadTranspiler();
    const second = await loadTranspiler();
    expect(first).toBe(second);
    expect(loads).toBe(1);
  });
});
