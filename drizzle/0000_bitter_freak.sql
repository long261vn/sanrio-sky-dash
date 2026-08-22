CREATE TABLE `leaderboard_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonId` int NOT NULL,
	`playerId` varchar(64) NOT NULL,
	`playerName` varchar(20) NOT NULL,
	`runnerId` varchar(32) NOT NULL,
	`score` int NOT NULL,
	`stars` int NOT NULL,
	`distance` int NOT NULL,
	`submittedAt` bigint NOT NULL,
	CONSTRAINT `leaderboard_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `leaderboard_entry_season_player_idx` UNIQUE(`seasonId`,`playerId`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard_seasons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonKey` varchar(10) NOT NULL,
	`startsAt` bigint NOT NULL,
	`resetsAt` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leaderboard_seasons_id` PRIMARY KEY(`id`),
	CONSTRAINT `leaderboard_seasons_seasonKey_unique` UNIQUE(`seasonKey`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `leaderboard_rank_idx` ON `leaderboard_entries` (`seasonId`,`score`,`submittedAt`);