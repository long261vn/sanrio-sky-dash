export const SPAWN_RULES = {
  hazardSpawnZBase: 54,
  hazardSpawnZPerLevel: 4,
  hazardSpawnZMax: 78,
  approachGuardZ: 42,
  minSpawnDelay: 0.92,
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
  return Math.max(SPAWN_RULES.minSpawnDelay, 2.05 - level * 0.17 - distance / 3_200) + randomOffset;
}
