import { describe, expect, it } from "vitest";
import { SITE_NAME, SITE_TAGLINE } from "./site";

describe("site 定数", () => {
  it("SITE_NAME / SITE_TAGLINE が定義されている", () => {
    expect(SITE_NAME).toBe("CodeSteps");
    expect(SITE_TAGLINE.length).toBeGreaterThan(0);
  });
});
