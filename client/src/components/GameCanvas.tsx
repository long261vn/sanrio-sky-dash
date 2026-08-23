/**
 * Mây Bông & Kẹo Ngọt: React giữ postcard/HUD nhẹ; Babylon chỉ nạp khi cần chạy.
 * Lệnh đầu tiên được xếp hàng để lần chạm "Chạy" không bao giờ bị mất trong lúc tải scene.
 */
import { useEffect, useRef } from "react";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { GameHandle } from "@/game/scene";
import type { GameCommand } from "@/game/types";
import { AudioManager } from "@/game/AudioManager";
import SkyDashHud from "@/components/SkyDashHud";
import { assetUrl } from "@/lib/assets";

const SKY_BACKGROUND_URL = assetUrl("sky-dash-background-retry_124d904a.png");
const isDemoMode = () => {
  const query = new URLSearchParams(window.location.search);
  return query.has("demo") || query.has("practice") || query.has("result") || query.has("lesson") || query.has("qaAction") || query.has("pickup") || query.has("qaDense");
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: Engine | null = null;
    let handle: GameHandle | null = null;
    let disposed = false;
    let ready = false;
    const queuedCommands: GameCommand[] = [];
    const menuAudio = new AudioManager();
    const emitMenuAudioState = (message?: string, musicStarted?: boolean) => {
      window.dispatchEvent(new CustomEvent("skydash:audio-state", { detail: { musicEnabled: menuAudio.musicEnabled, effectsEnabled: menuAudio.effectsEnabled, message, musicStarted } }));
    };
    const startMenuMusic = (withButton = false) => {
      if (withButton) menuAudio.play("button");
      void menuAudio.startMusic().then((started) => emitMenuAudioState(
        started ? "Nhạc nền đang phát." : menuAudio.musicEnabled ? "Chạm nút Nhạc để bật âm thanh." : "Nhạc nền đang tắt.",
        started,
      ));
    };

    const boot = async () => {
      if (startedRef.current || disposed) return;
      startedRef.current = true;
      const [{ Engine: BabylonEngine }, { createGameScene }] = await Promise.all([
        import("@babylonjs/core/Engines/engine"),
        import("@/game/scene"),
      ]);
      if (disposed) return;
      engine = new BabylonEngine(canvas, true, { alpha: true, preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
      const nextHandle = await createGameScene(engine, canvas, menuAudio);
      if (disposed) { nextHandle.dispose(); return; }
      handle = nextHandle;
      ready = true;
      engine.runRenderLoop(() => nextHandle.scene.render());
      queuedCommands.splice(0).forEach((command) => window.dispatchEvent(new CustomEvent<GameCommand>("skydash:command", { detail: command })));
    };

    const onPrepare = () => { void boot(); };
    const onCommand = (event: Event) => {
      const command = (event as CustomEvent<GameCommand>).detail;
      if (!ready) {
        if (command.type === "setMusic") {
          void menuAudio.setMusicEnabled(command.enabled, true).then((started) => emitMenuAudioState(command.enabled && !started ? "Chạm nút Nhạc để bật âm thanh." : command.enabled ? "Nhạc nền đang phát." : "Nhạc nền đã tắt.", started));
          return;
        }
        if (command.type === "setEffects") {
          menuAudio.setEffectsEnabled(command.enabled);
          if (command.enabled) menuAudio.play("button");
          emitMenuAudioState(command.enabled ? "Hiệu ứng đã bật." : "Hiệu ứng đã tắt.");
          return;
        }
        if (["select", "start", "practice", "menu"].includes(command.type)) {
          startMenuMusic(true);
        }
        if (startedRef.current) queuedCommands.push(command);
      }
    };
    const onMenuInteract = () => {
      startMenuMusic(true);
    };
    const onResize = () => engine?.resize();
    window.addEventListener("skydash:prepare", onPrepare);
    window.addEventListener("skydash:command", onCommand as EventListener);
    window.addEventListener("skydash:menu-interact", onMenuInteract);
    window.addEventListener("resize", onResize);
    if (isDemoMode()) void boot();

    return () => {
      disposed = true;
      window.removeEventListener("skydash:prepare", onPrepare);
      window.removeEventListener("skydash:command", onCommand as EventListener);
      window.removeEventListener("skydash:menu-interact", onMenuInteract);
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine?.dispose();
      menuAudio.dispose();
      startedRef.current = false;
    };
  }, []);

  return <main className="sky-dash-shell"><img className="sky-background" src={SKY_BACKGROUND_URL} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.opacity = "0"; }} /><canvas ref={canvasRef} className="sky-canvas" style={{ touchAction: "none" }} /><SkyDashHud /></main>;
}
