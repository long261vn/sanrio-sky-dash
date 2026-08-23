export const SPAWN_RULES = {
  hazardSpawnZBase: 54,
  hazardSpawnZPerLevel: 4,
  hazardSpawnZMax: 78,
  minSameLaneHazardGapZ: 18,
  minSpawnDelay: 0.78,
  warningSeconds: 2.1,
  minWarningZ: 19,
} as const;

export function getSpawnZ(level: number) {
  return Math.min(SPAWN_RULES.hazardSpawnZMax, SPAWN_RULES.hazardSpawnZBase + level * SPAWN_RULES.hazardSpawnZPerLevel);
}

export function getWarningZ(speed: number) {
  return Math.max(SPAWN_RULES.minWarningZ, speed * SPAWN_RULES.warningSeconds);
}

export function getNextSpawnDelay(level: number, distance: number, randomOffset: number) {
  return Math.max(SPAWN_RULES.minSpawnDelay, 1.72 - level * 0.13 - distance / 4_200) + randomOffset;
}

/** Giữ hai thử thách trên cùng làn cách nhau đủ xa để không ép thao tác liên tiếp. */
export function hasSafeLaneSpacing(
  existing: readonly { lane: number; z: number }[],
  candidateLanes: readonly number[],
  spawnZ: number,
) {
  return candidateLanes.every((lane) => existing.every((entity) => entity.lane !== lane || Math.abs(entity.z - spawnZ) >= SPAWN_RULES.minSameLaneHazardGapZ));
}
