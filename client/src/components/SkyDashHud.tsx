/**
 * Mây Bông & Kẹo Ngọt: HUD postcard dùng cream, blueberry ink và Sky Pudding.
 * Các nút phản hồi tức thì; lớp UI chỉ giao tiếp với gameplay bằng CustomEvent.
 */
import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, Trophy, Volume2, Zap } from "lucide-react";
import { CHARACTERS, type CharacterId, type GameCommand, type GameSnapshot } from "@/game/types";

const LOGO_URL = "/manus-storage/sky-dash-logo-retry_53835e27.png";
const TARGET_URL = "/manus-storage/sky-dash-menu-art-retry_f2351b45.png";

const initialSnapshot: GameSnapshot = {
  status: "menu",
  characterId: "cinnamoroll",
  score: 0,
  highScore: 0,
  stars: 0,
  distance: 0,
  multiplier: 1,
  shieldSeconds: 0,
  missionProgress: 0,
  message: "Chọn một người bạn để bắt đầu chuyến bay.",
  isNewRecord: false,
};

function send(command: GameCommand) {
  window.dispatchEvent(new CustomEvent<GameCommand>("skydash:command", { detail: command }));
}

export default function SkyDashHud() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [selectedId, setSelectedId] = useState<CharacterId>("cinnamoroll");

  useEffect(() => {
    const onState = (event: Event) => {
      const next = (event as CustomEvent<GameSnapshot>).detail;
      setSnapshot(next);
      setSelectedId(next.characterId);
    };
    window.addEventListener("skydash:state", onState);
    return () => window.removeEventListener("skydash:state", onState);
  }, []);

  const selected = useMemo(() => CHARACTERS.find((item) => item.id === selectedId) ?? CHARACTERS[0], [selectedId]);
  const isRunning = snapshot.status === "playing";

  return (
    <div className="sky-ui" aria-live="polite">
      {isRunning && (
        <>
          <div className="hud-cluster hud-cluster-left">
            <div className="hud-brand-mark" aria-label="Sanrio Sky Dash"><img src={LOGO_URL} alt="" /><span>SKY<br />DASH</span></div>
            <div className="hud-score-card">
              <span className="hud-label">Điểm bay</span>
              <strong>{snapshot.score.toLocaleString("vi-VN")}</strong>
              <span className="hud-sub">×{snapshot.multiplier.toFixed(1)} combo</span>
            </div>
            <div className="hud-star-card"><span>★</span>{snapshot.stars}</div>
          </div>
          <div className="hud-center-stack">
            <div className="mission-chip"><span>☁</span> Mục tiêu: {snapshot.missionProgress}/{10} sao</div>
            {snapshot.shieldSeconds > 0 && <div className="shield-chip"><Zap size={14} /> Khiên cầu vồng {snapshot.shieldSeconds}s</div>}
          </div>
          <div className="hud-cluster hud-cluster-right">
            <button className="pause-button" onClick={() => send({ type: "pause" })} aria-label="Tạm dừng"><Pause size={18} /></button>
            <div className="hud-distance-card"><span>Quãng đường</span><strong>{snapshot.distance}m</strong></div>
          </div>
          {snapshot.message && <div className="sky-toast">{snapshot.message}</div>}
          <div className="keyboard-hint">← → đổi làn <span>·</span> Space nhảy <span>·</span> ↓ trượt</div>
          <div className="touch-controls" aria-label="Điều khiển cảm ứng">
            <button onClick={() => send({ type: "lane", direction: -1 })}>←</button>
            <button className="jump-control" onClick={() => send({ type: "jump" })}>↑</button>
            <button onClick={() => send({ type: "lane", direction: 1 })}>→</button>
            <button className="slide-control" onClick={() => send({ type: "slide" })}>↓</button>
          </div>
        </>
      )}

      {snapshot.status === "menu" && (
        <div className="screen-scrim menu-scrim">
          <section className="menu-panel">
            <div className="menu-copy">
              <div className="brand-lockup"><img src={LOGO_URL} alt="Biểu tượng ngôi sao điều ước" /><span>SKY DASH</span></div>
              <p className="eyebrow">ENDLESS RUNNER · CLOUD EDITION</p>
              <h1>Bầu trời đang<br />gọi tên bạn.</h1>
              <p className="menu-intro">Dẫn một người bạn thật dễ thương lướt qua đường mây, né những bất ngờ ngọt ngào và gom đầy điều ước.</p>
              <div className="record-strip"><Trophy size={18} /><span>Kỷ lục bầu trời</span><strong>{snapshot.highScore.toLocaleString("vi-VN")}</strong></div>
              <div className="control-tips"><span>← → <b>đổi làn</b></span><span>SPACE <b>nhảy</b></span><span>↓ <b>trượt</b></span></div>
            </div>
            <div className="menu-art-wrap"><img className="menu-art" src={TARGET_URL} alt="Minh hoạ đường chạy trên mây" /><div className="art-sticker">★ Nhặt sao<br />để tăng combo</div></div>
            <div className="selection-drawer">
              <div className="drawer-heading"><div><p>CHỌN BẠN ĐỒNG HÀNH</p><h2>{selected.name}</h2></div><span>{selected.tagline}</span></div>
              <div className="character-grid">
                {CHARACTERS.map((character) => (
                  <button key={character.id} onClick={() => { setSelectedId(character.id); send({ type: "select", characterId: character.id }); }} className={`character-card ${selectedId === character.id ? "selected" : ""}`} style={{ "--character": character.body, "--accent": character.accent } as React.CSSProperties}>
                    <span className="portrait-disc">{character.icon}</span><span>{character.name}</span>
                  </button>
                ))}
              </div>
              <button className="play-button" onClick={() => send({ type: "start", characterId: selectedId })}><Play size={20} fill="currentColor" /> Chạy vào mây ngay</button>
              <p className="fan-note">Fan-made concept · Không liên kết hay đại diện cho Sanrio.</p>
            </div>
          </section>
        </div>
      )}

      {snapshot.status === "paused" && (
        <div className="screen-scrim compact-scrim"><section className="pause-panel"><img src={LOGO_URL} alt="" /><p>NHỊP MÂY ĐANG TẠM DỪNG</p><h2>Hít một hơi thật êm.</h2><button className="play-button" onClick={() => send({ type: "resume" })}><Play size={19} fill="currentColor" /> Bay tiếp nào</button><button className="quiet-button" onClick={() => send({ type: "menu" })}>Về bộ sưu tập</button></section></div>
      )}

      {snapshot.status === "gameover" && (
        <div className="screen-scrim compact-scrim"><section className="results-panel"><div className="result-badge">{snapshot.isNewRecord ? "★ KỶ LỤC MỚI" : "☁ CHUYẾN BAY HOÀN TẤT"}</div><h2>{snapshot.isNewRecord ? "Bầu trời vỗ tay!" : "Mây vẫn chờ bạn."}</h2><p>{snapshot.message}</p><div className="result-stats"><div><span>Điểm bay</span><strong>{snapshot.score.toLocaleString("vi-VN")}</strong></div><div><span>Sao điều ước</span><strong>★ {snapshot.stars}</strong></div><div><span>Quãng đường</span><strong>{snapshot.distance}m</strong></div></div><button className="play-button" onClick={() => send({ type: "restart" })}><RotateCcw size={19} /> Chạy thêm một lượt</button><button className="quiet-button" onClick={() => send({ type: "menu" })}><Volume2 size={15} /> Đổi bạn đồng hành</button></section></div>
      )}
    </div>
  );
}
