import { bigint, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Mỗi mùa bắt đầu lúc 00:00 thứ Bảy, theo múi giờ Việt Nam. */
export const leaderboardSeasons = mysqlTable("leaderboard_seasons", {
  id: int("id").autoincrement().primaryKey(),
  seasonKey: varchar("seasonKey", { length: 10 }).notNull().unique(),
  startsAt: bigint("startsAt", { mode: "number" }).notNull(),
  resetsAt: bigint("resetsAt", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Một thiết bị chỉ giữ lại thành tích cao nhất cho mỗi mùa. */
export const leaderboardEntries = mysqlTable("leaderboard_entries", {
  id: int("id").autoincrement().primaryKey(),
  seasonId: int("seasonId").notNull(),
  playerId: varchar("playerId", { length: 64 }).notNull(),
  playerName: varchar("playerName", { length: 20 }).notNull(),
  runnerId: varchar("runnerId", { length: 32 }).notNull(),
  score: int("score").notNull(),
  stars: int("stars").notNull(),
  distance: int("distance").notNull(),
  submittedAt: bigint("submittedAt", { mode: "number" }).notNull(),
}, (table) => [
  uniqueIndex("leaderboard_entry_season_player_idx").on(table.seasonId, table.playerId),
  index("leaderboard_rank_idx").on(table.seasonId, table.score, table.submittedAt),
]);

export type LeaderboardSeason = typeof leaderboardSeasons.$inferSelect;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
