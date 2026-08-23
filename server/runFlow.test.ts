import { describe, expect, it } from "vitest";
import { canStartSkyDashRun, needsLeaderboardName } from "../shared/runFlow";

describe("run flow", () => {
  it("requires both a valid player name and an explicit character selection before a run", () => {
    expect(canStartSkyDashRun("", false)).toBe(false);
    expect(canStartSkyDashRun("Hana", false)).toBe(false);
    expect(canStartSkyDashRun("", true)).toBe(false);
    expect(canStartSkyDashRun("Mây Nhỏ", true)).toBe(true);
    expect(needsLeaderboardName("")).toBe(true);
  });

  it("keeps the same two-character validation for player names", () => {
    expect(needsLeaderboardName(" A ")).toBe(true);
    expect(needsLeaderboardName("Mây Nhỏ")).toBe(false);
  });
});
