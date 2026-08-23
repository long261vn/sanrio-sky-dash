import { describe, expect, it } from "vitest";
import {
  type LeaderboardEntry,
  type LeaderboardRepository,
  type ScoreSubmission,
  getSeasonWindow,
  isScorePlausible,
  listLeaderboard,
  rankTop20,
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
    async getLatestSeason() { return latestSeason; },
    async insertEntry(entry) {
      const saved = { id: nextId++, ...entry };
      entries.push(saved);
      return saved;
    },
    async listEntries(seasonId) { return entries.filter((entry) => entry.seasonId === seasonId); },
  };
}

describe("getSeasonWindow", () => {
  it("keeps a Friday evening in the season that began on the previous Saturday in Vietnam", () => {
    expect(getSeasonWindow(new Date("2026-08-21T12:00:00.000Z")).seasonKey).toBe("2026-08-15");
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

  it("sorts by score then first submission, without stars, and returns at most 20 rows", () => {
    const rows = Array.from({ length: 22 }, (_, index) => ({ score: index % 3 === 0 ? 200 : 100, stars: index, submittedAt: index }));
    const ranked = rankTop20(rows);
    expect(ranked).toHaveLength(20);
    expect(ranked[0]).toMatchObject({ score: 200, rank: 1 });
    expect(ranked[0].submittedAt).toBe(0);
  });
});

describe("submitScore through a repository", () => {
  it("inserts a new score and makes it visible to the Top 20 response", async () => {
    const result = await submitScore(baseScore, createMemoryRepository());
    expect(result).toMatchObject({ rank: 1, enteredTop20: true });
    expect(result.entryId).toBeGreaterThan(0);
    expect(result.rows).toEqual([expect.objectContaining({ id: result.entryId, playerName: "Hana", score: 180, rank: 1 })]);
  });

  it("starts a fresh leaderboard on the first run after Saturday without changing the old season", async () => {
    const repository = createMemoryRepository();
    await submitScore(baseScore, repository, new Date("2026-08-21T12:00:00.000Z"));
    const result = await submitScore({ ...baseScore, score: 240, distance: 40 }, repository, new Date("2026-08-21T18:00:00.000Z"));
    expect(result).toMatchObject({ seasonKey: "2026-08-22", rank: 1 });
    expect(result.rows).toEqual([expect.objectContaining({ score: 240, playerName: "Hana", rank: 1 })]);
  });

  it("lưu hai lượt cùng người chơi thành hai dòng riêng khi đều vào Top 20", async () => {
    const repository = createMemoryRepository([{ id: 1, seasonId: 1, ...baseScore, score: 300, submittedAt: Date.now() - 30_000 }]);
    const result = await submitScore({ ...baseScore, score: 250, distance: 30 }, repository);
    expect(result).toMatchObject({ rank: 2, enteredTop20: true });
    expect(result.rows).toEqual([
      expect.objectContaining({ id: 1, playerName: "Hana", score: 300, rank: 1 }),
      expect.objectContaining({ id: result.entryId, playerName: "Hana", score: 250, rank: 2 }),
    ]);
  });

  it("cho phép tên hiển thị trùng nhau từ nhiều lượt và vẫn đánh dấu đúng lượt vừa lưu", async () => {
    const repository = createMemoryRepository([{ id: 1, seasonId: 1, ...baseScore, playerName: "Long", score: 300, submittedAt: 100 }]);
    const result = await submitScore({ ...baseScore, playerName: "Long", score: 250, distance: 30 }, repository);
    expect(result).toMatchObject({ rank: 2, enteredTop20: true });
    expect(result.rows[0]).toMatchObject({ playerName: "Long", score: 300, rank: 1 });
    expect(result.rows[1]).toMatchObject({ id: result.entryId, playerName: "Long", score: 250, rank: 2 });
  });

  it("xếp hai lượt hoà điểm theo lượt nộp sớm hơn, không theo số sao", async () => {
    const repository = createMemoryRepository([{ id: 1, seasonId: 1, ...baseScore, stars: 1, submittedAt: 100 }]);
    const result = await submitScore({ ...baseScore, stars: 99 }, repository, new Date());
    expect(result).toMatchObject({ rank: 2, enteredTop20: true });
    expect(result.rows[0]).toMatchObject({ id: 1, score: 180, stars: 1, rank: 1 });
  });

  it("returns the correct rank even when another player uses the same display name", async () => {
    const repository = createMemoryRepository([{ id: 1, seasonId: 1, ...baseScore, playerId: "other-player", playerName: "Hana", score: 300, submittedAt: Date.now() - 30_000 }]);
    const result = await submitScore({ ...baseScore, score: 180 }, repository);
    expect(result).toMatchObject({ rank: 2, enteredTop20: true });
  });

  it("lưu lượt ngoài Top 20 nhưng không báo sai rằng lượt đó đã được xếp hạng", async () => {
    const entries = Array.from({ length: 20 }, (_, index) => ({
      id: index + 1, seasonId: 1, playerId: `player-${index}`, playerName: `Mây ${index}`,
      runnerId: "cinnamoroll", score: 500 - index, stars: 0, distance: 100, submittedAt: index,
    }));
    const result = await submitScore({ ...baseScore, score: 180, distance: 30 }, createMemoryRepository(entries));
    expect(result).toMatchObject({ rank: null, enteredTop20: false });
    expect(result.rows).toHaveLength(20);
    expect(result.rows.some((row) => row.id === result.entryId)).toBe(false);
  });

  it("returns a ranked Top 20 response from the repository", async () => {
    const entries = Array.from({ length: 21 }, (_, index) => ({
      id: index + 1, seasonId: 1, playerId: `player-${index}`, playerName: `Mây ${index}`,
      runnerId: "cinnamoroll", score: index === 20 ? 500 : 100, stars: index, distance: 20, submittedAt: index,
    }));
    const result = await listLeaderboard(createMemoryRepository(entries));
    expect(result.rows).toHaveLength(20);
    expect(result.rows[0]).toMatchObject({ playerName: "Mây 20", score: 500, rank: 1 });
  });
});
