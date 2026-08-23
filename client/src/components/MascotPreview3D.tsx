import React, { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Shaders/ShadersInclude/helperFunctions";
import "@babylonjs/core/Shaders/default.vertex";
import "@babylonjs/core/Shaders/default.fragment";
import type { CharacterDefinition } from "@/game/types";
import { createMascotModel, orientMascotForPreview } from "@/game/MascotModel";

type PreviewHandle = { rotateBy: (radians: number) => void; pauseAutoSpin: () => void };

/** Uses the same MascotModel factory as GameWorld. No portrait/card substitute is allowed here. */
export function MascotPreview3D({ character, className = "" }: { character: CharacterDefinition; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<PreviewHandle | null>(null);
  const pointerX = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof WebGLRenderingContext === "undefined") return;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 0);
    const camera = new ArcRotateCamera("mascotPreviewCamera", -Math.PI / 2, 1.18, 4.05, new Vector3(0, 1.15, 0), scene);
    camera.inputs.clear();
    const light = new HemisphericLight("mascotPreviewLight", new Vector3(-0.35, 1, -0.7), scene);
    light.intensity = 1.3;
    const model = createMascotModel(scene, character, "previewRunner");
    orientMascotForPreview(model);
    model.root.scaling = new Vector3(1.1, 1.1, 1.1);
    model.root.rotation.y = -0.35;
    let autoResumeAt = performance.now() + 300;
    handleRef.current = {
      rotateBy: (radians) => { model.root.rotation.y += radians; autoResumeAt = performance.now() + 1100; },
      pauseAutoSpin: () => { autoResumeAt = performance.now() + 1100; },
    };
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    engine.runRenderLoop(() => {
      if (performance.now() > autoResumeAt) model.root.rotation.y += 0.012;
      scene.render();
    });
    return () => {
      window.removeEventListener("resize", onResize);
      handleRef.current = null;
      scene.dispose();
      engine.dispose();
    };
  }, [character.id]);

  return <div className={`mascot-preview ${className}`} aria-label={`Xem trước 3D ${character.name}`}>
    <canvas ref={canvasRef} className="mascot-preview-canvas" role="img" aria-label={`Mô hình 3D ${character.name} đang dùng khi chạy. Kéo để xoay.`}
      onPointerDown={(event) => { pointerX.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); handleRef.current?.pauseAutoSpin(); }}
      onPointerMove={(event) => { if (pointerX.current === null) return; handleRef.current?.rotateBy((event.clientX - pointerX.current) * 0.018); pointerX.current = event.clientX; }}
      onPointerUp={(event) => { pointerX.current = null; event.currentTarget.releasePointerCapture(event.pointerId); }}
      onPointerCancel={() => { pointerX.current = null; }} />
    <button type="button" className="preview-spin-button" onClick={() => handleRef.current?.rotateBy(Math.PI / 2)} aria-label={`Xoay ${character.name} thêm 90 độ`}><span aria-hidden="true">↻</span> Xoay model đang chạy</button>
  </div>;
}
