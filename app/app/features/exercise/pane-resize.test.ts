import { describe, expect, it } from "vitest";
import {
  clampGuideWidth,
  clampPreviewWidth,
  EDITOR_MIN_WIDTH,
  GUIDE_MIN_WIDTH,
  HANDLES_TOTAL_WIDTH,
  PREVIEW_MIN_WIDTH,
  reclampPaneWidths,
} from "./pane-resize";

// 代表的なデスクトップ幅。row 1400px / プレビュー 500px / 手順 320px
const ROW = 1400;

describe("clampGuideWidth", () => {
  it("余裕がある範囲では希望幅をそのまま返す", () => {
    expect(clampGuideWidth(400, ROW, 500)).toBe(400);
  });

  it("最小幅を下回らない", () => {
    expect(clampGuideWidth(50, ROW, 500)).toBe(GUIDE_MIN_WIDTH);
  });

  it("エディタの最低幅を侵さない(上限でクランプ)", () => {
    const max = ROW - 500 - EDITOR_MIN_WIDTH - HANDLES_TOTAL_WIDTH;
    expect(clampGuideWidth(10_000, ROW, 500)).toBe(max);
  });

  it("画面が狭く上限 < 最小幅でも最小幅を返す(ペインを消さない)", () => {
    expect(clampGuideWidth(300, 600, 500)).toBe(GUIDE_MIN_WIDTH);
  });
});

describe("clampPreviewWidth", () => {
  it("余裕がある範囲では希望幅をそのまま返す", () => {
    expect(clampPreviewWidth(600, ROW, 320)).toBe(600);
  });

  it("最小幅を下回らない", () => {
    expect(clampPreviewWidth(0, ROW, 320)).toBe(PREVIEW_MIN_WIDTH);
  });

  it("エディタの最低幅を侵さない(上限でクランプ)", () => {
    const max = ROW - 320 - EDITOR_MIN_WIDTH - HANDLES_TOTAL_WIDTH;
    expect(clampPreviewWidth(10_000, ROW, 320)).toBe(max);
  });

  it("画面が狭く上限 < 最小幅でも最小幅を返す(ペインを消さない)", () => {
    expect(clampPreviewWidth(500, 600, 320)).toBe(PREVIEW_MIN_WIDTH);
  });
});

describe("reclampPaneWidths(ウィンドウリサイズ後の再クランプ)", () => {
  it("余裕がある行幅では両方そのまま", () => {
    expect(reclampPaneWidths({ guide: 400, preview: 500 }, ROW)).toEqual({ guide: 400, preview: 500 });
  });

  it("行幅が縮んだら手順 → プレビューの順に丸め、エディタ最低幅を確保する", () => {
    // 1400px で広げた状態(手順 500 + プレビュー 600)から 1000px へ縮小
    const result = reclampPaneWidths({ guide: 500, preview: 600 }, 1000);
    // 手順はプレビュー 600 前提の上限まで丸められ、その後プレビューが残りに収まる
    expect(result.guide).toBe(GUIDE_MIN_WIDTH);
    expect(result.preview).toBe(1000 - GUIDE_MIN_WIDTH - EDITOR_MIN_WIDTH - HANDLES_TOTAL_WIDTH);
    // 合計がエディタ最低幅を侵さない
    expect(1000 - result.guide - (result.preview ?? 0) - HANDLES_TOTAL_WIDTH).toBeGreaterThanOrEqual(
      EDITOR_MIN_WIDTH,
    );
  });

  it("preview が flex 追従中(null)は null のまま、手順のみ丸める", () => {
    const result = reclampPaneWidths({ guide: 800, preview: null }, 1000);
    expect(result.preview).toBeNull();
    expect(result.guide).toBe(1000 - PREVIEW_MIN_WIDTH - EDITOR_MIN_WIDTH - HANDLES_TOTAL_WIDTH);
  });

  it("md 最小幅(768px)でも3ペインの最小幅が同時に成立する", () => {
    const result = reclampPaneWidths({ guide: 10_000, preview: 10_000 }, 768);
    expect(result.guide).toBeGreaterThanOrEqual(GUIDE_MIN_WIDTH);
    expect(result.preview).toBeGreaterThanOrEqual(PREVIEW_MIN_WIDTH);
    expect(768 - result.guide - (result.preview ?? 0) - HANDLES_TOTAL_WIDTH).toBeGreaterThanOrEqual(
      EDITOR_MIN_WIDTH,
    );
  });
});
