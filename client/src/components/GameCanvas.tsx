/**
 * Mây Bông & Kẹo Ngọt: canvas Babylon trong suốt nằm trên bầu trời minh hoạ;
 * React chỉ là postcard frame và HUD, còn gameplay độc lập trong `game/`.
 */
import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";
import SkyDashHud from "@/components/SkyDashHud";

const SKY_BACKGROUND_URL = "/manus-storage/sky-dash-background-retry_124d904a.png";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    const engine = new Engine(canvas, true, { alpha: true, preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    let handle: GameHandle | null = null;
    let disposed = false;
    createGameScene(engine, canvas).then((nextHandle) => {
      if (disposed) { nextHandle.dispose(); return; }
      handle = nextHandle;
      engine.runRenderLoop(() => nextHandle.scene.render());
    });
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  return <main className="sky-dash-shell"><img className="sky-background" src={SKY_BACKGROUND_URL} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.opacity = "0"; }} /><canvas ref={canvasRef} className="sky-canvas" style={{ touchAction: "none" }} /><SkyDashHud /></main>;
}
