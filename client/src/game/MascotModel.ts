import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";
import type { CharacterDefinition } from "@/game/types";

export type MascotModel = { root: TransformNode; visual: TransformNode; shieldRing: Mesh };
export const MASCOT_MODEL_VERSION = "recognition-v2";

function createMaterial(scene: Scene, name: string, hex: string, emissive: number) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(hex);
  material.emissiveColor = Color3.FromHexString(hex).scale(emissive);
  material.specularColor = new Color3(0.06, 0.06, 0.08);
  return material;
}

function sphere(
  scene: Scene,
  parent: TransformNode,
  name: string,
  position: Vector3,
  diameter: number,
  material: StandardMaterial,
  scaling?: Vector3,
) {
  const mesh = MeshBuilder.CreateSphere(name, { diameter, segments: 18 }, scene);
  mesh.parent = parent;
  mesh.position = position;
  mesh.material = material;
  if (scaling) mesh.scaling = scaling;
  return mesh;
}

function cone(
  scene: Scene,
  parent: TransformNode,
  name: string,
  position: Vector3,
  material: StandardMaterial,
  height: number,
  diameter: number,
) {
  const mesh = MeshBuilder.CreateCylinder(name, { height, diameterTop: 0.04, diameterBottom: diameter, tessellation: 12 }, scene);
  mesh.parent = parent;
  mesh.position = position;
  mesh.material = material;
  return mesh;
}

/**
 * Canonical mascot factory for gameplay and the 360° setup preview.
 * Every branch below follows the recognition checklist in MASCOT_REFERENCE_SPEC.md.
 */
export function createMascotModel(scene: Scene, character: CharacterDefinition, rootName = "runner"): MascotModel {
  const faceTone = character.silhouette === "cloud" || character.silhouette === "kitty" ? "#FFFDF8"
    : character.silhouette === "pudding" ? "#F7D47A"
      : character.silhouette === "bunny" || character.silhouette === "imp" ? "#FFF9F7"
        : character.silhouette === "egg" ? "#F7BE2C"
          : character.body;
  const rimTone = character.silhouette === "cloud" ? "#E6F8FF"
    : character.silhouette === "pudding" ? "#7A482A"
      : character.silhouette === "bunny" ? "#D95086"
        : character.silhouette === "imp" ? "#36243F"
          : character.silhouette === "penguin" ? "#1F2835"
            : character.silhouette === "frog" ? "#4C9A60"
              : character.silhouette === "egg" ? "#D7801D"
                : "#E85679";
  const body = createMaterial(scene, `body-${character.id}`, faceTone, 0.09);
  const accent = createMaterial(scene, `accent-${character.id}`, character.accent, 0.18);
  const softAccent = createMaterial(scene, `soft-${character.id}`, character.accentSoft, 0.08);
  const ink = createMaterial(scene, `ink-${character.id}`, "#233C62", 0.04);
  const rim = createMaterial(scene, `rim-${character.id}`, rimTone, 0.14);
  const cream = createMaterial(scene, `cream-${character.id}`, "#FFF9E8", 0.05);
  const golden = createMaterial(scene, `golden-${character.id}`, "#FFD45C", 0.18);
  const berry = createMaterial(scene, `berry-${character.id}`, "#F56E91", 0.2);
  const cocoa = createMaterial(scene, `cocoa-${character.id}`, "#754426", 0.08);
  const darkHood = createMaterial(scene, `dark-hood-${character.id}`, "#33243D", 0.1);

  const root = new TransformNode(rootName, scene);
  root.metadata = { mascotFactory: MASCOT_MODEL_VERSION, characterId: character.id };
  const visual = new TransformNode(`${rootName}-visual`, scene);
  visual.parent = root;
  visual.position = new Vector3(0, 0.2, -0.12);

  const bodyMesh = sphere(scene, visual, `${rootName}-avatarBody`, new Vector3(0, 0.72, 0), 1.18, body, new Vector3(0.82, 1.05, 0.72));
  const bodyRim = sphere(scene, visual, `${rootName}-bodyRim`, new Vector3(0, 0.72, 0.2), 1.26, rim, new Vector3(0.86, 1.1, 0.6));
  const head = sphere(scene, visual, `${rootName}-avatarHead`, new Vector3(0, 1.55, 0), 1.32, body, new Vector3(1, 0.94, 0.82));
  const headRim = sphere(scene, visual, `${rootName}-headRim`, new Vector3(0, 1.55, 0.22), 1.44, rim, new Vector3(1.04, 0.98, 0.62));

  const eyes: Mesh[] = [];
  const cheeks: Mesh[] = [];
  for (const x of [-0.24, 0.24]) {
    eyes.push(sphere(scene, visual, `${rootName}-avatarEye${x}`, new Vector3(x, 1.61, -0.55), 0.145, ink));
    const cheek = sphere(scene, visual, `${rootName}-avatarCheek${x}`, new Vector3(x * 1.75, 1.43, -0.54), 0.19, softAccent, new Vector3(1.3, 1, 1));
    cheeks.push(cheek);
  }
  const nose = sphere(scene, visual, `${rootName}-nose`, new Vector3(0, 1.51, -0.66), 0.105, character.silhouette === "kitty" ? golden : accent);
  const mouth = sphere(scene, visual, `${rootName}-mouth`, new Vector3(0, 1.37, -0.63), 0.07, ink, new Vector3(1.45, 0.48, 0.45));
  const arms: Mesh[] = [];
  for (const x of [-0.56, 0.56]) {
    const arm = sphere(scene, visual, `${rootName}-arm${x}`, new Vector3(x, 0.8, -0.03), 0.38, body, new Vector3(0.58, 1.05, 0.62));
    arm.rotation.z = x * -0.35;
    arms.push(arm);
  }
  const feet: Mesh[] = [];
  for (const x of [-0.28, 0.28]) {
    feet.push(sphere(
      scene,
      visual,
      `${rootName}-foot${x}`,
      new Vector3(x, 0.16, -0.24),
      0.33,
      character.silhouette === "penguin" ? golden : softAccent,
      new Vector3(0.9, 0.5, 1.25),
    ));
  }

  if (character.silhouette === "cloud") {
    bodyMesh.scaling = new Vector3(0.78, 0.88, 0.7);
    head.scaling = new Vector3(1.13, 0.86, 0.84);
    for (const x of [-0.68, 0.68]) {
      const ear = sphere(scene, visual, `${rootName}-cloudDropEar${x}`, new Vector3(x, 1.57, -0.04), 0.5, body, new Vector3(0.54, 1.7, 0.63));
      ear.rotation.z = x * -0.48;
      const inner = sphere(scene, visual, `${rootName}-cloudInnerEar${x}`, new Vector3(x, 1.57, -0.37), 0.36, accent, new Vector3(0.38, 1.08, 0.2));
      inner.rotation.z = x * -0.48;
    }
    const curl = MeshBuilder.CreateTorus(`${rootName}-cloudTailCurl`, { diameter: 0.36, thickness: 0.1, tessellation: 18 }, scene);
    curl.parent = visual;
    curl.position = new Vector3(-0.43, 0.72, 0.36);
    curl.rotation.x = Math.PI / 2;
    curl.material = body;
    sphere(scene, visual, `${rootName}-cloudTailTip`, new Vector3(-0.43, 0.72, 0.36), 0.12, accent);
  }

  if (character.silhouette === "pudding") {
    bodyMesh.scaling = new Vector3(1.0, 0.86, 0.8);
    head.scaling = new Vector3(1.1, 0.77, 0.86);
    const beret = sphere(scene, visual, `${rootName}-puddingBeret`, new Vector3(0, 2.05, -0.04), 0.72, cocoa, new Vector3(1.0, 0.27, 0.8));
    beret.rotation.z = -0.08;
    for (const x of [-0.57, 0.57]) {
      const ear = sphere(scene, visual, `${rootName}-puddingDropEar${x}`, new Vector3(x, 1.72, -0.02), 0.48, cocoa, new Vector3(0.68, 1.32, 0.58));
      ear.rotation.z = x * -0.55;
    }
    sphere(scene, visual, `${rootName}-puddingBelly`, new Vector3(0, 0.7, -0.5), 0.72, softAccent, new Vector3(1.13, 0.72, 0.23));
  }

  if (character.silhouette === "bunny") {
    const hood = sphere(scene, visual, `${rootName}-melodyHood`, new Vector3(0, 1.58, 0.22), 1.5, accent, new Vector3(1.02, 1, 0.58));
    head.scaling = new Vector3(0.84, 0.8, 0.76);
    for (const x of [-0.42, 0.42]) {
      const ear = sphere(scene, visual, `${rootName}-melodyHoodEar${x}`, new Vector3(x, 2.15, -0.02), 0.54, accent, new Vector3(0.72, 1.9, 0.62));
      ear.rotation.z = x * -0.28;
      sphere(scene, visual, `${rootName}-melodyInnerEar${x}`, new Vector3(x, 2.15, -0.35), 0.34, softAccent, new Vector3(0.45, 1.24, 0.2)).rotation.z = x * -0.28;
    }
    for (let index = 0; index < 5; index += 1) {
      sphere(
        scene,
        visual,
        `${rootName}-melodyFlowerPetal${index}`,
        new Vector3(0.5 + Math.cos(index * Math.PI * 0.4) * 0.13, 2.03 + Math.sin(index * Math.PI * 0.4) * 0.13, -0.58),
        0.16,
        cream,
      );
    }
    sphere(scene, visual, `${rootName}-melodyFlowerCenter`, new Vector3(0.5, 2.03, -0.66), 0.11, golden);
  }

  if (character.silhouette === "imp") {
    const hood = sphere(scene, visual, `${rootName}-kuromiJesterHood`, new Vector3(0, 1.58, 0.24), 1.48, darkHood, new Vector3(1.04, 1, 0.58));
    head.scaling = new Vector3(0.82, 0.8, 0.75);
    for (const x of [-0.48, 0.48]) {
      const horn = cone(scene, visual, `${rootName}-kuromiJesterPoint${x}`, new Vector3(x, 2.16, 0), darkHood, 0.72, 0.34);
      horn.rotation.z = x * -0.46;
      sphere(scene, visual, `${rootName}-kuromiJesterBell${x}`, new Vector3(x * 1.17, 2.47, -0.02), 0.12, softAccent);
    }
    const skull = sphere(scene, visual, `${rootName}-kuromiSkull`, new Vector3(0, 2.06, -0.62), 0.24, softAccent, new Vector3(1.08, 0.86, 0.28));
    for (const x of [-0.055, 0.055]) sphere(scene, visual, `${rootName}-kuromiSkullEye${x}`, new Vector3(x, 2.08, -0.72), 0.045, ink);
    const tail = MeshBuilder.CreateTorus(`${rootName}-kuromiDevilTail`, { diameter: 0.5, thickness: 0.075, tessellation: 18 }, scene);
    tail.parent = visual;
    tail.position = new Vector3(-0.43, 0.62, 0.34);
    tail.rotation.x = Math.PI / 2;
    tail.material = darkHood;
    const arrow = cone(scene, visual, `${rootName}-kuromiTailArrow`, new Vector3(-0.68, 0.62, 0.35), darkHood, 0.24, 0.22);
    arrow.rotation.z = -Math.PI / 2;
  }

  if (character.silhouette === "penguin") {
    bodyMesh.scaling = new Vector3(0.92, 1.22, 0.8);
    head.scaling = new Vector3(0.94, 0.74, 0.83);
    cheeks.forEach((cheek) => { cheek.isVisible = false; });
    nose.isVisible = false;
    mouth.isVisible = false;
    eyes.forEach((eye, index) => {
      eye.material = cream;
      eye.scaling = new Vector3(1.15, 0.72, 0.4);
      eye.position.y = 1.64;
      sphere(scene, visual, `${rootName}-penguinPupil${index}`, new Vector3(index === 0 ? -0.23 : 0.23, 1.64, -0.64), 0.06, ink);
    });
    sphere(scene, visual, `${rootName}-penguinBelly`, new Vector3(0, 0.78, -0.51), 0.98, cream, new Vector3(0.78, 1.0, 0.2));
    const beak = cone(scene, visual, `${rootName}-penguinBeak`, new Vector3(0, 1.44, -0.72), golden, 0.26, 0.28);
    beak.rotation.x = Math.PI / 2;
    [-0.36, -0.12, 0.12, 0.36].forEach((x, index) => {
      const tuft = cone(scene, visual, `${rootName}-penguinTuft${index}`, new Vector3(x, 2.05 - Math.abs(x) * 0.22, -0.03), body, 0.36, 0.26);
      tuft.rotation.z = x * -0.16;
    });
  }

  if (character.silhouette === "frog") {
    head.scaling = new Vector3(1.18, 0.78, 0.9);
    nose.isVisible = false;
    mouth.isVisible = false;
    [-0.35, 0.35].forEach((x, index) => {
      sphere(scene, visual, `${rootName}-frogEyeWhite${index}`, new Vector3(x, 2.03, -0.33), 0.46, cream, new Vector3(1, 1.08, 0.48));
      const eye = eyes[index];
      eye.position = new Vector3(x, 2.05, -0.61);
      eye.scaling = new Vector3(0.72, 0.88, 0.35);
    });
    const frogMouth = sphere(scene, visual, `${rootName}-frogMouth`, new Vector3(0, 1.43, -0.66), 0.17, ink, new Vector3(1.65, 0.32, 0.22));
    frogMouth.rotation.z = 0.03;
    const collar = MeshBuilder.CreateBox(`${rootName}-frogPinkCollar`, { width: 0.86, height: 0.15, depth: 0.07 }, scene);
    collar.parent = visual;
    collar.position = new Vector3(0, 0.98, -0.51);
    collar.material = berry;
    const stripe = MeshBuilder.CreateBox(`${rootName}-frogWhiteStripe`, { width: 0.16, height: 0.17, depth: 0.075 }, scene);
    stripe.parent = visual;
    stripe.position = new Vector3(0, 0.98, -0.56);
    stripe.material = cream;
  }

  if (character.silhouette === "egg") {
    head.isVisible = false;
    headRim.isVisible = false;
    bodyRim.isVisible = false;
    arms.forEach((arm) => { arm.isVisible = false; });
    feet.forEach((foot) => { foot.isVisible = false; });
    cheeks.forEach((cheek) => { cheek.isVisible = false; });
    bodyMesh.position = new Vector3(0, 0.52, -0.04);
    bodyMesh.scaling = new Vector3(1.03, 0.48, 0.82);
    nose.isVisible = false;
    mouth.position = new Vector3(0, 0.5, -0.67);
    mouth.scaling = new Vector3(1.3, 0.4, 0.35);
    [-0.13, 0.13].forEach((x, index) => {
      const eye = eyes[index];
      eye.position = new Vector3(x, 0.68, -0.67);
      eye.scaling = new Vector3(0.72, 0.42, 0.38);
    });
    sphere(scene, visual, `${rootName}-eggWhite`, new Vector3(0, 0.28, 0.14), 1.55, cream, new Vector3(1.22, 0.26, 0.78));
  }

  if (character.silhouette === "kitty") {
    mouth.isVisible = false;
    for (const x of [-0.44, 0.44]) {
      const ear = cone(scene, visual, `${rootName}-kittyEar${x}`, new Vector3(x, 2.12, -0.02), body, 0.58, 0.44);
      ear.rotation.z = x * -0.18;
      const inner = cone(scene, visual, `${rootName}-kittyInnerEar${x}`, new Vector3(x, 2.12, -0.2), softAccent, 0.38, 0.23);
      inner.rotation.z = x * -0.18;
    }
    const bowLeft = sphere(scene, visual, `${rootName}-kittyBowLeft`, new Vector3(0.47, 1.96, -0.5), 0.31, accent, new Vector3(1.2, 0.78, 0.35));
    bowLeft.rotation.z = -0.25;
    const bowRight = sphere(scene, visual, `${rootName}-kittyBowRight`, new Vector3(0.69, 1.96, -0.5), 0.31, accent, new Vector3(1.2, 0.78, 0.35));
    bowRight.rotation.z = 0.25;
    sphere(scene, visual, `${rootName}-kittyBowKnot`, new Vector3(0.58, 1.96, -0.7), 0.13, berry);
    const whiskerRows = [1.59, 1.49, 1.39];
    whiskerRows.forEach((y, row) => {
      for (const side of [-1, 1]) {
        const whisker = MeshBuilder.CreateBox(`${rootName}-kittyWhisker${side}-${row}`, { width: 0.29, height: 0.025, depth: 0.025 }, scene);
        whisker.parent = visual;
        whisker.position = new Vector3(side * 0.55, y, -0.69);
        whisker.rotation.z = side * (row === 0 ? 0.18 : row === 2 ? -0.18 : 0);
        whisker.material = ink;
      }
    });
  }

  const badge = MeshBuilder.CreateTorus(`${rootName}-runnerBadge`, { diameter: 0.38, thickness: 0.07, tessellation: 18 }, scene);
  badge.parent = visual;
  badge.position = new Vector3(0, character.silhouette === "egg" ? 0.55 : 0.96, -0.58);
  badge.rotation.x = Math.PI / 2;
  badge.material = accent;
  const shieldRing = MeshBuilder.CreateTorus("shieldRing", { diameter: 2.25, thickness: 0.075, tessellation: 32 }, scene);
  shieldRing.parent = root;
  shieldRing.position.y = 1.1;
  shieldRing.rotation.x = Math.PI / 2;
  shieldRing.material = softAccent;
  shieldRing.isVisible = false;
  return { root, visual, shieldRing };
}
