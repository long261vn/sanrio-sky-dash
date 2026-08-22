import { describe, expect, it } from "vitest";
import { canStartSkyDashRun, needsLeaderboardName } from "../shared/runFlow";

describe("run flow", () => {
  it("always allows a player to begin a run, even before naming a leaderboard entry", () => {
    expect(canStartSkyDashRun()).toBe(true);
    expect(needsLeaderboardName("")).toBe(true);
  });

  it("only asks for a name at the point of leaderboard saving", () => {
    expect(needsLeaderboardName(" A ")).toBe(true);
    expect(needsLeaderboardName("Mây Nhỏ")).toBe(false);
  });
});
