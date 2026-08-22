import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { leaderboardEntries, leaderboardSeasons } from "../drizzle/schema";
import { getDb } from "./db";

const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DUPLICATE_REQUEST_WINDOW_MS = 1_200;
const recentSubmitByPlayer = new Map<string, number>();

export type ScoreSubmission = {
  playerId: string;
  playerName: string;
  runnerId: string;
  score: number;
  stars: number;
  distance: number;
};

export type SeasonWindow = { seasonKey: string; startsAt: number; resetsAt: number };
export type LeaderboardSeason = SeasonWindow & { id: number };
export type LeaderboardEntry = ScoreSubmission & { id: number; seasonId: number; submittedAt: number };
export type LeaderboardRow = Pick<LeaderboardEntry, "playerName" | "runnerId" | "score" | "stars" | "distance" | "submittedAt">;

export type LeaderboardRepository = {
  upsertSeason: (window: SeasonWindow) => Promise<LeaderboardSeason>;
  getLatestSeason: () => Promise<LeaderboardSeason | null>;
  getPlayerEntry: (seasonId: number, playerId: string) => Promise<LeaderboardEntry | null>;
  insertEntry: (entry: Omit<LeaderboardEntry, "id">) => Promise<void>;
  updateEntry: (id: number, entry: Omit<LeaderboardEntry, "id" | "seasonId" | "playerId">) => Promise<void>;
  listEntries: (seasonId: number) => Promise<LeaderboardEntry[]>;
};

export function isScorePlausible(input: Pick<ScoreSubmission, "score" | "stars" | "distance">) {
  const maximumExpectedScore = Math.max(420, input.distance * 55 + 1_200);
  const maximumDistance = Math.max(120, input.score * 3);
  return input.score <= maximumExpectedScore && input.distance <= maximumDistance;
}

export function isBetterScore(previous: Pick<ScoreSubmission, "score" | "stars"> | null, next: Pick<ScoreSubmission, "score" | "stars">) {
  return !previous || next.score > previous.score;
}

export function rankTop30<T extends { score: number; stars: number; submittedAt: number }>(rows: T[]) {
  return [...rows]
    .sort((a, b) => b.score - a.score || a.submittedAt - b.submittedAt)
    .slice(0, 30)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

/** Tính tuần bắt đầu thứ Bảy bằng lịch Việt Nam, không phụ thuộc timezone server. */
export function getSeasonWindow(now = new Date()): SeasonWindow {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: VIETNAM_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value ?? 0);
  const year = part("year");
  const month = part("month");
  const day = part("day");
  const localCalendarDay = Date.UTC(year, month - 1, day);
  const vietnamDayOfWeek = new Date(localCalendarDay).getUTCDay();
  const daysSinceSaturday = (vietnamDayOfWeek + 1) % 7;
  const startCalendarDay = localCalendarDay - daysSinceSaturday * 24 * 60 * 60 * 1000;
  const startDate = new Date(startCalendarDay);
  const seasonKey = startDate.toISOString().slice(0, 10);
  // 00:00 Việt Nam tương đương 17:00 UTC của ngày trước.
  const startsAt = startCalendarDay - 7 * 60 * 60 * 1000;
  return { seasonKey, startsAt, resetsAt: startsAt + WEEK_MS };
}

async function createDatabaseRepository(): Promise<LeaderboardRepository> {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");

  return {
    async upsertSeason(window) {
      await db.insert(leaderboardSeasons).values(window).onDuplicateKeyUpdate({ set: { seasonKey: window.seasonKey } });
      const [season] = await db.select().from(leaderboardSeasons).where(eq(leaderboardSeasons.seasonKey, window.seasonKey)).limit(1);
      if (!season) throw new Error("Unable to create leaderboard season");
      return season;
    },
    async getLatestSeason() {
      const [season] = await db.select().from(leaderboardSeasons).orderBy(desc(leaderboardSeasons.startsAt)).limit(1);
      return season ?? null;
    },
    async getPlayerEntry(seasonId, playerId) {
      const [entry] = await db.select().from(leaderboardEntries).where(and(
        eq(leaderboardEntries.seasonId, seasonId),
        eq(leaderboardEntries.playerId, playerId),
      )).limit(1);
      return entry ?? null;
    },
    async insertEntry(entry) {
      await db.insert(leaderboardEntries).values(entry);
    },
    async updateEntry(id, entry) {
      await db.update(leaderboardEntries).set(entry).where(eq(leaderboardEntries.id, id));
    },
    async listEntries(seasonId) {
      return db
        .select({
          id: leaderboardEntries.id,
          seasonId: leaderboardEntries.seasonId,
          playerId: leaderboardEntries.playerId,
          playerName: leaderboardEntries.playerName,
          runnerId: leaderboardEntries.runnerId,
          score: leaderboardEntries.score,
          stars: leaderboardEntries.stars,
          distance: leaderboardEntries.distance,
          submittedAt: leaderboardEntries.submittedAt,
        })
        .from(leaderboardEntries)
        .where(eq(leaderboardEntries.seasonId, seasonId))
        .orderBy(desc(leaderboardEntries.score), leaderboardEntries.submittedAt)
        .limit(30);
    },
  };
}

async function resolveRepository(repository?: LeaderboardRepository) {
  return repository ?? createDatabaseRepository();
}

async function buildLeaderboard(repository: LeaderboardRepository) {
  const season = await repository.getLatestSeason();
  if (!season) return { seasonKey: getSeasonWindow().seasonKey, rankedRows: [], rows: [] as Array<LeaderboardRow & { rank: number }> };
  const rankedRows = rankTop30(await repository.listEntries(season.id));
  const rows = rankedRows.map(({ id: _id, seasonId: _seasonId, playerId: _playerId, ...row }) => row);
  return { seasonKey: season.seasonKey, rankedRows, rows };
}

export async function listLeaderboard(repository?: LeaderboardRepository) {
  const repo = await resolveRepository(repository);
  const leaderboard = await buildLeaderboard(repo);
  return { seasonKey: leaderboard.seasonKey, rows: leaderboard.rows };
}

export async function submitScore(input: ScoreSubmission, repository?: LeaderboardRepository) {
  if (!isScorePlausible(input)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Điểm số không khớp với quãng đường và sao đã thu thập." });
  }
  const repo = await resolveRepository(repository);
  const season = await repo.upsertSeason(getSeasonWindow());
  const previous = await repo.getPlayerEntry(season.id, input.playerId);
  const submittedAt = Date.now();
  if (!repository) {
    const previousRequestAt = recentSubmitByPlayer.get(input.playerId);
    if (previousRequestAt && submittedAt - previousRequestAt < DUPLICATE_REQUEST_WINDOW_MS) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Đang đồng bộ kết quả chuyến bay, hãy chờ một nhịp nhé." });
    }
    recentSubmitByPlayer.set(input.playerId, submittedAt);
  }

  const improved = isBetterScore(previous, input);
  if (!previous) {
    await repo.insertEntry({ seasonId: season.id, ...input, submittedAt });
  } else if (improved) {
    await repo.updateEntry(previous.id, {
      playerName: input.playerName,
      runnerId: input.runnerId,
      score: input.score,
      stars: input.stars,
      distance: input.distance,
      submittedAt,
    });
  } else {
    // Một người chơi chỉ có một kỷ lục/mùa; đổi tên phải cập nhật dòng hiện có
    // ngay cả khi lượt sau có điểm thấp hơn.
    await repo.updateEntry(previous.id, {
      playerName: input.playerName,
      runnerId: input.runnerId,
      score: previous.score,
      stars: previous.stars,
      distance: previous.distance,
      submittedAt: previous.submittedAt,
    });
  }

  const leaderboard = await buildLeaderboard(repo);
  const playerRank = leaderboard.rankedRows.find((row) => row.playerId === input.playerId)?.rank ?? null;
  return { seasonKey: leaderboard.seasonKey, rows: leaderboard.rows, rank: playerRank, improved, enteredTop30: playerRank !== null };
}
