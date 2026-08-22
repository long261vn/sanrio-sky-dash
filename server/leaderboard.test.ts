import { describe, expect, it } from "vitest";
import {
  type LeaderboardEntry,
  type LeaderboardRepository,
  type ScoreSubmission,
  getSeasonWindow,
  isBetterScore,
  isScorePlausible,
  listLeaderboard,
  rankTop30,
  submitScore,
} from "./leaderboard";

const baseScore: ScoreSubmission = {
  playerId: "player-hana",
  playerName: "Hana",
  runnerId: "cinnamoroll",
  score: 180,
  stars: 0,
  distance: 20,
};

function createMemoryRepository(initialEntries: LeaderboardEntry[] = []): LeaderboardRepository {
  const entries = [...initialEntries];
  const initialSeason = { id: 1, ...getSeasonWindow() };
  const seasons = new Map([[initialSeason.seasonKey, initialSeason]]);
  let latestSeason = initialSeason;
  let nextId = Math.max(0, ...entries.map((entry) => entry.id)) + 1;

  return {
    async upsertSeason(window) {
      const existing = seasons.get(window.seasonKey);
      if (existing) {
        latestSeason = existing;
        return existing;
      }
      const next = { id: seasons.size + 1, ...window };
      seasons.set(window.seasonKey, next);
      latestSeason = next;
      return next;
    },
    async getLatestSeason() {
      return latestSeason;
    },
    async getPlayerEntry(seasonId, playerId) {
      return entries.find((entry) => entry.seasonId === seasonId && entry.playerId === playerId) ?? null;
    },
    async insertEntry(entry) {
      entries.push({ id: nextId++, ...entry });
    },
    async updateEntry(id, update) {
      const entry = entries.find((item) => item.id === id);
      if (entry) Object.assign(entry, update);
    },
    async listEntries(seasonId) {
      return entries.filter((entry) => entry.seasonId === seasonId);
    },
  };
}

describe("getSeasonWindow", () => {
  it("keeps a Friday evening in the season that began on the previous Saturday in Vietnam", () => {
    const window = getSeasonWindow(new Date("2026-08-21T12:00:00.000Z"));
    expect(window.seasonKey).toBe("2026-08-15");
  });

  it("creates the new season on Saturday morning in Vietnam", () => {
    const window = getSeasonWindow(new Date("2026-08-21T18:00:00.000Z"));
    expect(window.seasonKey).toBe("2026-08-22");
    expect(window.resetsAt - window.startsAt).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe("leaderboard safeguards", () => {
  it("accepts plausible game scores and rejects implausible score-distance combinations", () => {
    expect(isScorePlausible({ score: 180, stars: 0, distance: 22 })).toBe(true);
    expect(isScorePlausible({ score: 999_999, stars: 0, distance: 1 })).toBe(false);
  });

  it("only replaces a score when score improves, never because of stars", () => {
    expect(isBetterScore({ score: 300, stars: 3 }, { score: 299, stars: 99 })).toBe(false);
    expect(isBetterScore({ score: 300, stars: 3 }, { score: 300, stars: 4 })).toBe(false);
  });

  it("sorts by score then first submission, without stars, and returns at most 30 rows", () => {
    const rows = Array.from({ length: 32 }, (_, index) => ({ score: index % 3 === 0 ? 200 : 100, stars: index, submittedAt: index }));
    const ranked = rankTop30(rows);
    expect(ranked).toHaveLength(30);
    expect(ranked[0]).toMatchObject({ score: 200, rank: 1 });
    expect(ranked[0].submittedAt).toBe(0);
  });
});

describe("submitScore through a repository", () => {
  it("inserts a new score and makes it visible to the Top 30 response", async () => {
    const result = await submitScore(baseScore, createMemoryRepository());
    expect(result).toMatchObject({ improved: true, rank: 1 });
    expect(result.rows).toEqual([expect.objectContaining({ playerName: "Hana", score: 180, rank: 1 })]);
  });

  it("starts a fresh leaderboard on the first run after Saturday without changing the old season", async () => {
    const repository = createMemoryRepository();
    await submitScore(baseScore, repository, new Date("2026-08-21T12:00:00.000Z"));
    const result = await submitScore({ ...baseScore, score: 240, distance: 40 }, repository, new Date("2026-08-21T18:00:00.000Z"));

    expect(result).toMatchObject({ seasonKey: "2026-08-22", rank: 1 });
    expect(result.rows).toEqual([expect.objectContaining({ score: 240, playerName: "Hana", rank: 1 })]);
  });

  it("retains the higher score when a later run is lower", async () => {
    const repository = createMemoryRepository([{ id: 1, seasonId: 1, ...baseScore, score: 300, submittedAt: Date.now() - 30_000 }]);
    const result = await submitScore({ ...baseScore, score: 250, distance: 30 }, repository);
    expect(result).toMatchObject({ improved: false, rank: 1 });
    expect(result.rows[0]).toMatchObject({ score: 300, stars: 0 });
  });

  it("updates a player's display name on a lower-score run while preserving the personal best", async () => {
    const repository = createMemoryRepository([{ id: 1, seasonId: 1, ...baseScore, playerName: "Long", score: 300, submittedAt: 100 }]);
    const result = await submitScore({ ...baseScore, playerName: "Long 3", score: 250, distance: 30 }, repository);
    expect(result).toMatchObject({ improved: false, rank: 1 });
    expect(result.rows[0]).toMatchObject({ playerName: "Long 3", score: 300, submittedAt: 100 });
  });

  it("does not update a tied score when the same player collected more stars", async () => {
    const repository = createMemoryRepository([{ id: 1, seasonId: 1, ...baseScore, stars: 1, submittedAt: Date.now() - 30_000 }]);
    const result = await submitScore({ ...baseScore, stars: 2 }, repository);
    expect(result).toMatchObject({ improved: false, rank: 1 });
    expect(result.rows[0]).toMatchObject({ score: 180, stars: 1 });
  });

  it("returns the correct rank even when another player uses the same display name", async () => {
    const repository = createMemoryRepository([{ id: 1, seasonId: 1, ...baseScore, playerId: "other-player", score: 300, submittedAt: Date.now() - 30_000 }]);
    const result = await submitScore({ ...baseScore, score: 180 }, repository);
    expect(result).toMatchObject({ rank: 2, enteredTop30: true });
  });

  it("returns a ranked Top 30 response from the repository", async () => {
    const seasonId = 1;
    const entries = Array.from({ length: 31 }, (_, index) => ({
      id: index + 1,
      seasonId,
      playerId: `player-${index}`,
      playerName: `Mây ${index}`,
      runnerId: "cinnamoroll",
      score: index === 30 ? 500 : 100,
      stars: index,
      distance: 20,
      submittedAt: index,
    }));
    const result = await listLeaderboard(createMemoryRepository(entries));
    expect(result.rows).toHaveLength(30);
    expect(result.rows[0]).toMatchObject({ playerName: "Mây 30", score: 500, rank: 1 });
  });
});
