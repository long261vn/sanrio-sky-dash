import React, { useEffect, useRef, useState } from "react";
import type { CharacterDefinition } from "@/game/types";
import { assetUrl } from "@/lib/assets";

function previewPortrait(character: CharacterDefinition) {
  return assetUrl(character.portrait.split("/").pop() ?? character.portrait);
}

export function MascotPreview3D({ character, className = "" }: { character: CharacterDefinition; className?: string }) {
  const [turn, setTurn] = useState(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const cooldown = useRef(0);

  useEffect(() => {
    setTurn(0);
    const timer = window.setInterval(() => {
      if (!dragging.current && performance.now() > cooldown.current) setTurn((value) => value + 0.8);
    }, 48);
    return () => window.clearInterval(timer);
  }, [character.id]);

  const startDrag = (clientX: number) => {
    dragging.current = true;
    lastX.current = clientX;
    cooldown.current = performance.now() + 1100;
  };
  const moveDrag = (clientX: number) => {
    if (!dragging.current) return;
    const delta = clientX - lastX.current;
    setTurn((value) => value + delta * 0.72);
    lastX.current = clientX;
    cooldown.current = performance.now() + 1100;
  };
  const endDrag = () => { dragging.current = false; cooldown.current = performance.now() + 800; };
  const style = { "--turn": `${turn}deg`, "--character": character.body, "--accent": character.accent, "--soft": character.accentSoft } as React.CSSProperties;

  return <div className={`mascot-preview ${className}`} style={style} aria-label={`Xem trước 3D ${character.name}`}>
    <div className="mascot-preview-stage" role="img" aria-label={`Mô hình xoay 3D ${character.name}. Kéo để xoay.`}
      onPointerDown={(event) => { startDrag(event.clientX); event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={(event) => moveDrag(event.clientX)}
      onPointerUp={(event) => { endDrag(); event.currentTarget.releasePointerCapture(event.pointerId); }}
      onPointerCancel={endDrag}>
      <div className={`preview-mascot-model silhouette-${character.silhouette}`}>
        <i className="preview-ear preview-ear--left" aria-hidden="true" />
        <i className="preview-ear preview-ear--right" aria-hidden="true" />
        <i className="preview-topper" aria-hidden="true" />
        <div className="preview-face preview-face--front"><img src={previewPortrait(character)} alt="" /></div>
        <div className="preview-face preview-face--back" aria-hidden="true"><b>{character.icon}</b><span>{character.name}</span></div>
        <i className="preview-side preview-side--left" aria-hidden="true" />
        <i className="preview-side preview-side--right" aria-hidden="true" />
      </div>
    </div>
    <button type="button" className="preview-spin-button" onClick={() => { setTurn((value) => value + 90); cooldown.current = performance.now() + 900; }} aria-label={`Xoay ${character.name} thêm 90 độ`}><span aria-hidden="true">↻</span> Kéo để xoay 360°</button>
  </div>;
}
