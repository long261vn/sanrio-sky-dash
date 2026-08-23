import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Scene } from "@babylonjs/core/scene";
import { afterEach, describe, expect, it } from "vitest";
import {
  createMascotModel,
  GAMEPLAY_MASCOT_FACING_Y,
  MASCOT_MODEL_VERSION,
  orientMascotForGameplay,
  orientMascotForPreview,
  PREVIEW_MASCOT_FACING_Y,
} from "./MascotModel";
import { CHARACTERS } from "./types";

const expectedRecognitionMeshes: Record<string, string[]> = {
  cinnamoroll: ["cloudDropEar", "cloudInnerEar", "cloudTailCurl"],
  pompompurin: ["puddingBeret", "puddingDropEar", "puddingBelly"],
  mymelody: ["melodyHood", "melodyHoodEar", "melodyFlower"],
  kuromi: ["kuromiJesterPoint", "kuromiSkull", "kuromiDevilTail"],
  badtzmaru: ["penguinBelly", "penguinBeak", "penguinTuft3"],
  keroppi: ["frogEyeWhite", "frogPinkCollar", "frogWhiteStripe"],
  gudetama: ["eggWhite"],
  hellokitty: ["kittyEar", "kittyBowLeft", "kittyWhisker-1-2"],
};

describe("createMascotModel", () => {
  const scenes: Scene[] = [];

  afterEach(() => {
    scenes.splice(0).forEach((scene) => {
      const engine = scene.getEngine();
      scene.dispose();
      engine.dispose();
    });
  });

  it.each(CHARACTERS)("keeps the recognition silhouette for $name", (character) => {
    const scene = new Scene(new NullEngine());
    scenes.push(scene);
    const model = createMascotModel(scene, character, "spec");
    const names = model.visual.getChildMeshes().map((mesh) => mesh.name).join("|");

    expect(model.root.name).toBe("spec");
    expect(model.root.metadata).toMatchObject({ mascotFactory: MASCOT_MODEL_VERSION, characterId: character.id });
    expect(model.shieldRing.name).toBe("shieldRing");
    expectedRecognitionMeshes[character.id].forEach((marker) => expect(names).toContain(marker));
    const firstEye = model.visual.getChildMeshes().find((mesh) => mesh.name.includes("avatarEye"));
    const backHead = model.visual.getChildMeshes().find((mesh) => mesh.name.endsWith("headRim"));
    expect(firstEye?.position.z).toBeLessThan(0);
    expect(backHead?.position.z).toBeGreaterThan(0);
  });

  it("uses the same factory result contract needed by gameplay and preview", () => {
    const scene = new Scene(new NullEngine());
    scenes.push(scene);
    const model = createMascotModel(scene, CHARACTERS[0], "previewRunner");

    expect(model.visual.parent).toBe(model.root);
    expect(model.shieldRing.parent).toBe(model.root);
    expect(model.visual.getChildMeshes().some((mesh) => mesh.name.endsWith("avatarBody"))).toBe(true);
  });

  it("keeps the mesh shared while gameplay faces forward and preview opens at the front", () => {
    const scene = new Scene(new NullEngine());
    scenes.push(scene);
    const model = createMascotModel(scene, CHARACTERS[0], "orientation");

    orientMascotForGameplay(model);
    expect(model.root.rotation.y).toBe(GAMEPLAY_MASCOT_FACING_Y);
    expect(model.root.metadata).toMatchObject({ presentation: "gameplay-forward" });

    orientMascotForPreview(model);
    expect(model.root.rotation.y).toBe(PREVIEW_MASCOT_FACING_Y);
    expect(model.root.metadata).toMatchObject({ presentation: "preview-front" });
  });
});
