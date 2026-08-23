import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";
import type { CharacterDefinition } from "@/game/types";

export type MascotModel = { root: TransformNode; visual: TransformNode; shieldRing: Mesh };

function createMaterial(scene: Scene, name: string, hex: string, emissive: number) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(hex);
  material.emissiveColor = Color3.FromHexString(hex).scale(emissive);
  material.specularColor = new Color3(0.06, 0.06, 0.08);
  return material;
}

/** The canonical in-game mascot. Keep every readable silhouette cue here so preview and runner never diverge. */
export function createMascotModel(scene: Scene, character: CharacterDefinition, rootName = "runner"): MascotModel {
  const body = createMaterial(scene, `body-${character.id}`, character.body, 0.06);
  const accent = createMaterial(scene, `accent-${character.id}`, character.accent, 0.18);
  const softAccent = createMaterial(scene, `soft-${character.id}`, character.accentSoft, 0.08);
  const ink = createMaterial(scene, `ink-${character.id}`, "#233C62", 0.04);
  const root = new TransformNode(rootName, scene);
  const visual = new TransformNode(`${rootName}-visual`, scene);
  visual.parent = root;
  visual.position = new Vector3(0, 0.2, -0.12);

  const bodyMesh = MeshBuilder.CreateSphere(`${rootName}-avatarBody`, { diameter: 1.18, segments: 20 }, scene);
  bodyMesh.parent = visual;
  bodyMesh.position.y = 0.72;
  bodyMesh.scaling = new Vector3(0.82, 1.05, 0.72);
  bodyMesh.material = body;
  const head = MeshBuilder.CreateSphere(`${rootName}-avatarHead`, { diameter: 1.32, segments: 20 }, scene);
  head.parent = visual;
  head.position.y = 1.55;
  head.scaling = new Vector3(1, 0.94, 0.82);
  head.material = body;
  for (const x of [-0.24, 0.24]) {
    const eye = MeshBuilder.CreateSphere(`${rootName}-avatarEye${x}`, { diameter: 0.12, segments: 12 }, scene);
    eye.parent = visual;
    eye.position = new Vector3(x, 1.61, -0.55);
    eye.material = ink;
    const cheek = MeshBuilder.CreateSphere(`${rootName}-avatarCheek${x}`, { diameter: 0.17, segments: 12 }, scene);
    cheek.parent = visual;
    cheek.position = new Vector3(x * 1.75, 1.43, -0.54);
    cheek.scaling.x = 1.3;
    cheek.material = softAccent;
  }

  if (character.silhouette === "cloud" || character.silhouette === "bunny") for (const x of [-0.37, 0.37]) {
    const ear = MeshBuilder.CreateSphere(`${rootName}-avatarEar${x}`, { diameter: 0.48, segments: 18 }, scene);
    ear.parent = visual; ear.position = new Vector3(x, 2.18, 0); ear.scaling = new Vector3(0.72, 1.7, 0.58); ear.rotation.z = x * -0.4; ear.material = character.silhouette === "bunny" ? accent : body;
  }
  if (character.silhouette === "cloud") {
    bodyMesh.scaling = new Vector3(0.75, 0.9, 0.68); head.scaling = new Vector3(1.12, 0.86, 0.82);
    for (const x of [-0.54, 0.54]) { const ear = MeshBuilder.CreateSphere(`${rootName}-cloudDropEar${x}`, { diameter: 0.5, segments: 18 }, scene); ear.parent = visual; ear.position = new Vector3(x, 1.66, -0.02); ear.scaling = new Vector3(0.48, 1.85, 0.62); ear.rotation.z = x * -0.22; ear.material = body; }
    const tail = MeshBuilder.CreateSphere(`${rootName}-cloudTail`, { diameter: 0.42, segments: 14 }, scene); tail.parent = visual; tail.position = new Vector3(-0.46, 0.68, 0.36); tail.material = accent;
  }
  if (character.silhouette === "pudding") {
    bodyMesh.scaling = new Vector3(0.98, 0.83, 0.78); head.scaling = new Vector3(1.1, 0.75, 0.86);
    const beret = MeshBuilder.CreateSphere(`${rootName}-puddingBeret`, { diameter: 0.75, segments: 16 }, scene); beret.parent = visual; beret.position = new Vector3(0.13, 2.08, -0.03); beret.scaling.y = 0.32; beret.material = accent;
    for (const x of [-0.52, 0.52]) { const ear = MeshBuilder.CreateSphere(`${rootName}-puddingEar${x}`, { diameter: 0.43, segments: 16 }, scene); ear.parent = visual; ear.position = new Vector3(x, 1.75, 0.08); ear.scaling = new Vector3(0.65, 1.3, 0.58); ear.rotation.z = x * -0.55; ear.material = accent; }
  }
  if (character.silhouette === "bunny" || character.silhouette === "imp") {
    const hood = MeshBuilder.CreateSphere(`${rootName}-${character.silhouette}Hood`, { diameter: character.silhouette === "bunny" ? 1.48 : 1.45, segments: 20 }, scene); hood.parent = visual; hood.position.y = 1.56; hood.scaling = character.silhouette === "bunny" ? new Vector3(1.02, 0.99, 0.86) : new Vector3(1.03, 0.98, 0.86); hood.material = accent; head.scaling = new Vector3(character.silhouette === "bunny" ? 0.84 : 0.82, 0.8, character.silhouette === "bunny" ? 0.76 : 0.75);
  }
  if (character.silhouette === "bunny") for (const x of [-0.34, 0.34]) { const ear = MeshBuilder.CreateSphere(`${rootName}-melodyHoodEar${x}`, { diameter: 0.52, segments: 16 }, scene); ear.parent = visual; ear.position = new Vector3(x, 2.2, -0.01); ear.scaling = new Vector3(0.72, 1.9, 0.62); ear.rotation.z = x * -0.26; ear.material = accent; }
  if (character.silhouette === "imp") {
    for (const x of [-0.4, 0, 0.4]) { const spike = MeshBuilder.CreatePolyhedron(`${rootName}-impSpike${x}`, { type: 1, size: 0.4 }, scene); spike.parent = visual; spike.position = new Vector3(x, 2.2 - Math.abs(x) * 0.35, 0); spike.scaling.y = 1.25; spike.material = accent; }
    const skull = MeshBuilder.CreateSphere(`${rootName}-kuromiSkull`, { diameter: 0.22, segments: 12 }, scene); skull.parent = visual; skull.position = new Vector3(0, 2.09, -0.5); skull.material = softAccent;
  }
  if (character.silhouette === "penguin") {
    bodyMesh.scaling = new Vector3(0.92, 1.2, 0.8); head.scaling = new Vector3(0.94, 0.72, 0.83);
    const belly = MeshBuilder.CreateSphere(`${rootName}-penguinBelly`, { diameter: 0.9, segments: 18 }, scene); belly.parent = visual; belly.position = new Vector3(0, 0.78, -0.51); belly.scaling = new Vector3(0.72, 0.92, 0.2); belly.material = softAccent;
    const beak = MeshBuilder.CreatePolyhedron(`${rootName}-penguinBeak`, { type: 1, size: 0.24 }, scene); beak.parent = visual; beak.position = new Vector3(0, 1.45, -0.7); beak.material = accent;
    for (const x of [-0.28, 0, 0.28]) { const tuft = MeshBuilder.CreatePolyhedron(`${rootName}-penguinTuft${x}`, { type: 1, size: 0.22 }, scene); tuft.parent = visual; tuft.position = new Vector3(x, 2.07 - Math.abs(x) * 0.25, -0.04); tuft.material = accent; }
  }
  if (character.silhouette === "frog") {
    for (const x of [-0.34, 0.34]) { const bulge = MeshBuilder.CreateSphere(`${rootName}-frogEye${x}`, { diameter: 0.38, segments: 16 }, scene); bulge.parent = visual; bulge.position = new Vector3(x, 1.98, -0.25); bulge.material = body; }
    head.scaling = new Vector3(1.15, 0.78, 0.9); const mouth = MeshBuilder.CreateSphere(`${rootName}-frogMouth`, { diameter: 0.16, segments: 12 }, scene); mouth.parent = visual; mouth.position = new Vector3(0, 1.38, -0.62); mouth.scaling = new Vector3(1.6, 0.42, 0.25); mouth.material = accent;
  }
  if (character.silhouette === "egg") { bodyMesh.scaling = new Vector3(0.75, 1.28, 0.72); head.isVisible = false; for (const mesh of visual.getChildMeshes()) if (mesh.name.includes("avatarEye") || mesh.name.includes("avatarCheek")) mesh.position.y -= 0.38; }
  if (character.silhouette === "kitty") {
    for (const x of [-0.44, 0.44]) { const ear = MeshBuilder.CreatePolyhedron(`${rootName}-kittyEar${x}`, { type: 1, size: 0.38 }, scene); ear.parent = visual; ear.position = new Vector3(x, 2.14, 0); ear.scaling.y = 1.25; ear.material = body; }
    const bow = MeshBuilder.CreateSphere(`${rootName}-kittyBow`, { diameter: 0.42, segments: 14 }, scene); bow.parent = visual; bow.position = new Vector3(0.56, 1.92, -0.42); bow.scaling.x = 1.45; bow.material = accent;
    for (const x of [-0.52, -0.42, 0.42, 0.52]) { const whisker = MeshBuilder.CreateBox(`${rootName}-kittyWhisker${x}`, { width: 0.28, height: 0.025, depth: 0.025 }, scene); whisker.parent = visual; whisker.position = new Vector3(x, 1.48, -0.68); whisker.rotation.z = x < 0 ? -0.12 : 0.12; whisker.material = ink; }
  }
  const badge = MeshBuilder.CreateTorus(`${rootName}-runnerBadge`, { diameter: 0.38, thickness: 0.07, tessellation: 18 }, scene); badge.parent = visual; badge.position = new Vector3(0, 0.96, -0.58); badge.rotation.x = Math.PI / 2; badge.material = accent;
  const shieldRing = MeshBuilder.CreateTorus("shieldRing", { diameter: 2.25, thickness: 0.075, tessellation: 32 }, scene); shieldRing.parent = root; shieldRing.position.y = 1.1; shieldRing.rotation.x = Math.PI / 2; shieldRing.material = softAccent; shieldRing.isVisible = false;
  return { root, visual, shieldRing };
}
