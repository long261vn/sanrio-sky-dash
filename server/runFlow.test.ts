import { describe, expect, it } from "vitest";
import { canStartSkyDashRun, needsLeaderboardName } from "../shared/runFlow";

describe("run flow", () => {
  it("requires a valid player name while allowing the default mascot without reselection", () => {
    expect(canStartSkyDashRun("")).toBe(false);
    expect(canStartSkyDashRun("H")).toBe(false);
    expect(canStartSkyDashRun("Hana")).toBe(true);
    expect(canStartSkyDashRun("Mây Nhỏ")).toBe(true);
    expect(needsLeaderboardName("")).toBe(true);
  });

  it("keeps the same two-character validation for player names", () => {
    expect(needsLeaderboardName(" A ")).toBe(true);
    expect(needsLeaderboardName("Mây Nhỏ")).toBe(false);
  });
});
