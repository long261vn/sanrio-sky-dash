import { describe, expect, it } from "vitest";
import { SPAWN_RULES, getNextSpawnDelay, getSpawnZ, getWarningZ, hasSafeLaneSpacing } from "../shared/spawnRules";

describe("spawn công bằng", () => {
  it("đặt vật thể đủ xa, kể cả khi độ khó tăng", () => {
    expect(getSpawnZ(1)).toBe(58);
    expect(getSpawnZ(6)).toBe(78);
    expect(getSpawnZ(99)).toBe(SPAWN_RULES.hazardSpawnZMax);
    expect(getSpawnZ(1)).toBeGreaterThan(getWarningZ(21));
  });

  it("giữ cảnh báo đủ sớm và tăng nhịp spawn nhưng không tụt dưới sàn an toàn", () => {
    expect(getWarningZ(8)).toBe(SPAWN_RULES.minWarningZ);
    expect(getWarningZ(10)).toBe(20.5);
    expect(getWarningZ(25)).toBeCloseTo(51.25);
    expect(getNextSpawnDelay(6, 10_000, 0)).toBe(SPAWN_RULES.minSpawnDelay);
    expect(getNextSpawnDelay(1, 0, 0)).toBeGreaterThan(getNextSpawnDelay(5, 300, 0));
    expect(getNextSpawnDelay(1, 0, 0)).toBeCloseTo(1.31);
  });

  it("cho phép nhịp liên tiếp ở các làn khác nhưng không ép cùng làn quá sát", () => {
    const active = [{ lane: 1, z: 46 }];
    const nextZ = 58;
    expect(hasSafeLaneSpacing(active, [0], nextZ)).toBe(true);
    expect(hasSafeLaneSpacing(active, [1], nextZ)).toBe(false);
    expect(hasSafeLaneSpacing(active, [0, 2], nextZ)).toBe(true);
  });
});
