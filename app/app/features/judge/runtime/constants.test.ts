// runtime/constants.ts は lesson-kit の loop-protect.ts(acorn 依存)から
// 判定バンドルを守るための複製。このテストが両者の同期を保証する。
import {
  LOOP_LIMIT_MESSAGE_JP as KIT_LOOP_LIMIT_MESSAGE_JP,
  LOOP_PROTECT_ERROR_MESSAGE as KIT_LOOP_PROTECT_ERROR_MESSAGE,
} from "@codesteps/lesson-kit";
import { describe, expect, it } from "vitest";
import { LOOP_LIMIT_MESSAGE_JP, LOOP_PROTECT_ERROR_MESSAGE } from "./constants";

describe("runtime/constants", () => {
  it("lesson-kit の定数と同値である", () => {
    expect(LOOP_PROTECT_ERROR_MESSAGE).toBe(KIT_LOOP_PROTECT_ERROR_MESSAGE);
    expect(LOOP_LIMIT_MESSAGE_JP).toBe(KIT_LOOP_LIMIT_MESSAGE_JP);
  });
});
