import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { GameWorld } from "@/game/GameWorld";
import "@babylonjs/core/Shaders/default.vertex";
import "@babylonjs/core/Shaders/default.fragment";

export type GameHandle = {
  scene: Scene;
  dispose: () => void;
};

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 0);

  const camera = new UniversalCamera("skyDashCamera", new Vector3(0, 5.7, -12.8), scene);
  camera.setTarget(new Vector3(0, 0.9, 0));
  camera.fov = 0.86;
  camera.fovMode = Camera.FOVMODE_VERTICAL_FIXED;
  camera.minZ = 0.1;
  camera.maxZ = 150;

  const skyLight = new HemisphericLight("skyLight", new Vector3(0, 1, 0.2), scene);
  skyLight.diffuse = Color3.FromHexString("#FFF8E6");
  skyLight.groundColor = Color3.FromHexString("#7CC5E8");
  skyLight.intensity = 0.88;

  const keyLight = new DirectionalLight("sunshine", new Vector3(-0.25, -1, 0.25), scene);
  keyLight.position = new Vector3(8, 18, -12);
  keyLight.diffuse = Color3.FromHexString("#FFF1BF");
  keyLight.intensity = 0.6;

  const glow = new GlowLayer("softStarGlow", scene, { mainTextureFixedSize: 512, blurKernelSize: 36 });
  glow.intensity = 0.28;

  const world = new GameWorld(scene, canvas);
  const updateObserver = scene.onBeforeRenderObservable.add(() => {
    world.update(scene.getEngine().getDeltaTime() / 1000);
  });

  return {
    scene,
    dispose: () => {
      scene.onBeforeRenderObservable.remove(updateObserver);
      world.dispose();
      scene.dispose();
    },
  };
}
