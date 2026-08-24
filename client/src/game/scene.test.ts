import { describe, expect, it } from "vitest";
import { GAMEPLAY_CAMERA_POSITION, GAMEPLAY_CAMERA_TARGET } from "./scene";

describe("gameplay camera framing", () => {
  it("keeps the runner low in frame by aiming beyond it", () => {
    expect(GAMEPLAY_CAMERA_POSITION.z).toBeLessThan(0);
    expect(GAMEPLAY_CAMERA_TARGET.z).toBeGreaterThan(0);
    expect(GAMEPLAY_CAMERA_TARGET.y).toBeGreaterThan(0.9);
  });
});
