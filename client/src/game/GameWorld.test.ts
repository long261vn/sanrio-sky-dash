import { describe, expect, it, vi } from "vitest";
import { GameWorld } from "./GameWorld";

type TestEntityKind = "lowHurdle" | "cloudGate" | "star" | "shield" | "gust";

function collisionWorld(kind: TestEntityKind) {
  const world = Object.create(GameWorld.prototype) as GameWorld & Record<string, unknown>;
  const removeEntity = vi.fn();
  Object.assign(world, {
    entities: [{ kind, lane: 1, spin: 0, node: { position: { x: 0, y: 0, z: 0 }, rotation: { z: 0 }, dispose: vi.fn() } }],
    player: { position: { x: 0 } },
    elapsed: 0,
    isPractice: false,
    practiceStep: 0,
    playerAirHeight: kind === "lowHurdle" ? 1 : 0,
    slideTimer: kind === "cloudGate" ? 1 : 0,
    shieldTimer: 0,
    multiplier: 1,
    score: 0,
    stars: 0,
    characterId: "cinnamoroll",
    audio: { play: vi.fn() },
    showMessage: vi.fn(),
    removeEntity,
  });
  return { world, removeEntity };
}

describe("GameWorld keyboard input", () => {
  it("maps desktop lane, jump and slide keys to the same gameplay commands", () => {
    const world = Object.create(GameWorld.prototype) as GameWorld & {
      handleCommand: ReturnType<typeof vi.fn>;
    };
    world.handleCommand = vi.fn();

    for (const key of ["ArrowLeft", "ArrowRight", " ", "ArrowDown"]) {
      const event = { key, repeat: false, preventDefault: vi.fn() } as unknown as KeyboardEvent;
      (world as unknown as { handleKey: (event: KeyboardEvent) => void }).handleKey(event);
    }

    expect(world.handleCommand.mock.calls.map(([command]) => command)).toEqual([
      { type: "lane", direction: -1 },
      { type: "lane", direction: 1 },
      { type: "jump" },
      { type: "slide" },
    ]);
  });

  it("applies the shared collision outcomes for items and cleared obstacles", () => {
    const star = collisionWorld("star");
    (star.world as unknown as { updateEntities: (delta: number, speed: number) => void }).updateEntities(0, 0);
    expect(star.world.stars).toBe(1);
    expect(star.world.multiplier).toBe(1.2);
    expect(star.removeEntity).toHaveBeenCalledWith(0);

    const shield = collisionWorld("shield");
    (shield.world as unknown as { updateEntities: (delta: number, speed: number) => void }).updateEntities(0, 0);
    expect(shield.world.shieldTimer).toBeGreaterThan(0);
    expect(shield.removeEntity).toHaveBeenCalledWith(0);

    const gust = collisionWorld("gust");
    (gust.world as unknown as { updateEntities: (delta: number, speed: number) => void }).updateEntities(0, 0);
    expect(gust.world.score).toBe(90);
    expect(gust.world.multiplier).toBe(1.5);
    expect(gust.removeEntity).toHaveBeenCalledWith(0);

    for (const kind of ["lowHurdle", "cloudGate"] as const) {
      const obstacle = collisionWorld(kind);
      (obstacle.world as unknown as { updateEntities: (delta: number, speed: number) => void }).updateEntities(0, 0);
      expect(obstacle.world.score).toBe(18);
      expect(obstacle.removeEntity).toHaveBeenCalledWith(0);
    }
  });
});
