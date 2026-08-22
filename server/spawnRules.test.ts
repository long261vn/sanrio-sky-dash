import { describe, expect, it } from "vitest";
import { SPAWN_RULES, getNextSpawnDelay, getSpawnZ, getWarningZ } from "../shared/spawnRules";

describe("spawn công bằng", () => {
  it("đặt vật thể đủ xa, kể cả khi độ khó tăng", () => {
    expect(getSpawnZ(1)).toBe(50);
    expect(getSpawnZ(6)).toBe(70);
    expect(getSpawnZ(99)).toBe(SPAWN_RULES.hazardSpawnZMax);
    expect(getSpawnZ(1)).toBeGreaterThan(SPAWN_RULES.approachGuardZ);
  });

  it("giữ cảnh báo đủ sớm và không để nhịp spawn tụt dưới sàn an toàn", () => {
    expect(getWarningZ(10)).toBe(SPAWN_RULES.minWarningZ);
    expect(getWarningZ(25)).toBeCloseTo(42.5);
    expect(getNextSpawnDelay(6, 10_000, 0)).toBe(SPAWN_RULES.minSpawnDelay);
  });
});
