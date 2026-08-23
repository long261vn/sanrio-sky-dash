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
  it("builds a raised cloud gate with a taller clear slide silhouette", () => {
    const world = Object.create(GameWorld.prototype) as GameWorld & { createStickerProp: ReturnType<typeof vi.fn>; createCloudGate: (root: unknown) => void };
    world.createStickerProp = vi.fn();

    world.createCloudGate({});

    expect(world.createStickerProp).toHaveBeenCalledWith(expect.anything(), "highSlideGate", expect.any(String), 2.78, 3.04, 2.12);
  });

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
    expect(star.world.score).toBe(4);
    expect(star.world.multiplier).toBe(1);
    expect((star.world.audio as { play: ReturnType<typeof vi.fn> }).play).toHaveBeenCalledWith("pickup");
    expect(star.removeEntity).toHaveBeenCalledWith(0);

    const shield = collisionWorld("shield");
    (shield.world as unknown as { updateEntities: (delta: number, speed: number) => void }).updateEntities(0, 0);
    expect(shield.world.shieldTimer).toBeGreaterThan(0);
    expect(shield.removeEntity).toHaveBeenCalledWith(0);

    const gust = collisionWorld("gust");
    (gust.world as unknown as { updateEntities: (delta: number, speed: number) => void }).updateEntities(0, 0);
    expect(gust.world.score).toBe(40);
    expect(gust.world.multiplier).toBe(1);
    expect((gust.world.audio as { play: ReturnType<typeof vi.fn> }).play).toHaveBeenCalledWith("pickup");
    expect(gust.removeEntity).toHaveBeenCalledWith(0);

    for (const kind of ["lowHurdle", "cloudGate"] as const) {
      const obstacle = collisionWorld(kind);
      (obstacle.world as unknown as { updateEntities: (delta: number, speed: number) => void }).updateEntities(0, 0);
      expect(obstacle.world.score).toBe(32);
      expect(obstacle.removeEntity).toHaveBeenCalledWith(0);
    }
  });

  it("plays feedback for jump and the end of a run", () => {
    const jumpWorld = Object.create(GameWorld.prototype) as GameWorld & Record<string, unknown>;
    const jumpAudio = { play: vi.fn() };
    Object.assign(jumpWorld, { player: {}, playerAirHeight: 0, slideTimer: 0, characterId: "cinnamoroll", audio: jumpAudio, showMessage: vi.fn() });
    (jumpWorld as unknown as { jump: () => void }).jump();
    expect(jumpAudio.play).toHaveBeenCalledWith("jump");

    const finishWorld = Object.create(GameWorld.prototype) as GameWorld & Record<string, unknown>;
    const finishAudio = { pauseMusic: vi.fn(), play: vi.fn() };
    Object.assign(finishWorld, { audio: finishAudio, score: 600, highScore: 700, newRecord: false, setStatus: vi.fn() });
    (finishWorld as unknown as { endRun: () => void }).endRun();
    expect(finishAudio.pauseMusic).toHaveBeenCalledOnce();
    expect(finishAudio.play).toHaveBeenCalledWith("gameover");
  });

  it("raises difficulty gradually by distance with a capped late-game speed", () => {
    const world = Object.create(GameWorld.prototype) as GameWorld & { distance: number };
    const getDifficulty = () => (world as unknown as { getDifficulty: () => { level: number; speed: number } }).getDifficulty();

    world.distance = 0;
    expect(getDifficulty()).toEqual({ level: 1, speed: 8.4 });
    world.distance = 110;
    expect(getDifficulty().level).toBe(2);
    expect(getDifficulty().speed).toBeGreaterThan(8.4);
    world.distance = 550;
    expect(getDifficulty().level).toBe(6);
    expect(getDifficulty().speed).toBeLessThanOrEqual(21);
  });

  it("keeps a safe lane in dense hazard beats and reintroduces star coins", () => {
    const world = Object.create(GameWorld.prototype) as GameWorld & Record<string, unknown>;
    const spawnEntity = vi.fn();
    Object.assign(world, { spawnEntity, entities: [] });

    const random = vi.fn()
      .mockReturnValueOnce(0.2) // dense hazard beat
      .mockReturnValueOnce(0.5) // pickup lane (unused for hazard)
      .mockReturnValueOnce(0.5) // safe lane centre
      .mockReturnValueOnce(0.2) // low hurdle
      .mockReturnValueOnce(0.2); // second hazard at level 3
    (world as unknown as { random: () => number }).random = random;
    (world as unknown as { spawnBeat: (level: number) => void }).spawnBeat(3);
    expect(spawnEntity).toHaveBeenCalledTimes(2);
    expect(spawnEntity.mock.calls.map(([, lane]) => lane).sort()).toEqual([0, 2]);

    spawnEntity.mockClear();
    (world as unknown as { random: () => number }).random = vi.fn()
      .mockReturnValueOnce(0.9) // star beat
      .mockReturnValueOnce(0.5) // lane centre
      .mockReturnValueOnce(0.2); // add a second star at level 3
    (world as unknown as { spawnBeat: (level: number) => void }).spawnBeat(3);
    expect(spawnEntity.mock.calls.map(([kind]) => kind)).toEqual(["star", "star"]);
  });
});
