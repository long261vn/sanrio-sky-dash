export const SPAWN_RULES = {
  hazardSpawnZBase: 46,
  hazardSpawnZPerLevel: 4,
  hazardSpawnZMax: 72,
  approachGuardZ: 38,
  minSpawnDelay: 0.95,
  warningSeconds: 1.7,
  minWarningZ: 17,
} as const;

export function getSpawnZ(level: number) {
  return Math.min(SPAWN_RULES.hazardSpawnZMax, SPAWN_RULES.hazardSpawnZBase + level * SPAWN_RULES.hazardSpawnZPerLevel);
}

export function getWarningZ(speed: number) {
  return Math.max(SPAWN_RULES.minWarningZ, speed * SPAWN_RULES.warningSeconds);
}

export function getNextSpawnDelay(level: number, distance: number, randomOffset: number) {
  return Math.max(SPAWN_RULES.minSpawnDelay, 1.56 - level * 0.08 - distance / 3400) + randomOffset;
}
