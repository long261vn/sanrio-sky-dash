/**
 * Mây Bông & Kẹo Ngọt: HUD postcard dùng cream, blueberry ink và Sky Pudding.
 * Các nút phản hồi tức thì; lớp UI chỉ giao tiếp với gameplay bằng CustomEvent.
 */
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, CircleHelp, Gauge, Pause, Play, RotateCcw, Trophy, Volume2, VolumeX, Zap } from "lucide-react";
import { CHARACTERS, type CharacterId, type GameCommand, type GameSnapshot } from "@/game/types";
import { assetUrl } from "@/lib/assets";

const LOGO_URL = assetUrl("sky-dash-logo-retry_53835e27.png");
const TARGET_URL = assetUrl("sky-dash-menu-art-retry_f2351b45.png");
const GUIDE_STAR_URL = assetUrl("hana-star-reward_f0db88ad.png");
const GUIDE_JUMP_URL = assetUrl("hana-low-jump-cushion_8c9af18d.png");
const GUIDE_SLIDE_URL = assetUrl("hana-high-slide-gate_b3d23f2c.png");

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
  message: "Chọn một người bạn để bắt đầu đường chạy mây.",
  isNewRecord: false,
  audioEnabled: true,
  difficultyLevel: 1,
  speed: 10,
  actionHint: null,
  isPractice: false,
  practiceStep: 0,
};

function send(command: GameCommand) {
  window.dispatchEvent(new CustomEvent<GameCommand>("skydash:command", { detail: command }));
}

export default function SkyDashHud() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [selectedId, setSelectedId] = useState<CharacterId>("cinnamoroll");
  const [tutorialOpen, setTutorialOpen] = useState(() => new URLSearchParams(window.location.search).has("guide"));

  useEffect(() => {
    const onState = (event: Event) => {
      const next = (event as CustomEvent<GameSnapshot>).detail;
      setSnapshot(next);
      setSelectedId(next.characterId);
      if (next.status === "playing") setTutorialOpen(false);
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
          <div className="game-topbar">
            <div className="runner-status">
              <span className="runner-icon" style={{ "--character": selected.body, "--accent": selected.accent } as React.CSSProperties}>{selected.icon}</span>
              <span><b>{selected.name}</b><small>{selected.tagline}</small></span>
            </div>
            <div className="game-score"><small>Điểm</small><strong>{snapshot.score.toLocaleString("vi-VN")}</strong><span>★ {snapshot.stars} · ×{snapshot.multiplier.toFixed(1)}</span></div>
            <div className="game-meta"><div className="game-progress"><span>{snapshot.isPractice ? `Luyện tập ${snapshot.practiceStep + 1}/3` : `Mục tiêu ${snapshot.missionProgress}/10 sao`}</span><b><Gauge size={14} /> {snapshot.isPractice ? "Đường mây an toàn" : `Cấp ${snapshot.difficultyLevel} · ${snapshot.speed} km/h`}</b>{snapshot.shieldSeconds > 0 && <em><Zap size={13} /> Khiên {snapshot.shieldSeconds}s</em>}</div><div className="game-actions"><span>{snapshot.distance}m</span><button className="sound-button" onClick={() => send({ type: "toggleAudio" })} aria-label={snapshot.audioEnabled ? "Tắt âm thanh" : "Bật âm thanh"}>{snapshot.audioEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</button><button className="pause-button" onClick={() => send({ type: "pause" })} aria-label="Tạm dừng"><Pause size={18} /></button></div></div>
          </div>
          {snapshot.message && <div className="sky-toast">{snapshot.message}</div>}
          {snapshot.actionHint && <div className={`action-callout ${snapshot.actionHint}`}><small>VẬT CẢN SẮP TỚI</small><strong>{snapshot.actionHint === "jump" ? "NHẢY!" : "TRƯỢT!"}</strong><span>{snapshot.actionHint === "jump" ? "SPACE hoặc ↑" : "↓ để trượt dưới"}</span></div>}
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
              <div className="brand-lockup"><img src={LOGO_URL} alt="Biểu tượng ngôi sao điều ước" /><span>CHẠY ĐUA CÙNG HANA</span></div>
              <button className="menu-sound-toggle" onClick={() => send({ type: "toggleAudio" })} aria-label={snapshot.audioEnabled ? "Tắt nhạc nền" : "Bật nhạc nền"}>{snapshot.audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}<span>{snapshot.audioEnabled ? "Nhạc nền: Bật" : "Nhạc nền: Tắt"}</span></button>
              <p className="eyebrow">ENDLESS RUNNER · CLOUD COLLECTION</p>
              <h1>Chọn người bạn<br />dẫn đường.</h1>
              <p className="menu-intro">Mỗi người chạy có dáng riêng và một thế mạnh thực sự. Chọn người bạn phù hợp, rồi lướt qua ba làn mây để săn sao điều ước.</p>
              <div className="record-strip"><Trophy size={18} /><span>Kỷ lục bầu trời</span><strong>{snapshot.highScore.toLocaleString("vi-VN")}</strong></div>
              <button className="guide-button" onClick={() => setTutorialOpen(true)}><CircleHelp size={17} /> Xem hướng dẫn đường chạy</button>
            </div>
            <div className="menu-art-wrap"><img className="menu-art" src={TARGET_URL} alt="Minh hoạ đường chạy trên mây" /><div className="art-sticker">★ Nhặt sao<br />để tăng combo</div></div>
            <div className="selection-drawer">
              <div className="drawer-heading"><div className="selected-runner"><span className="portrait-disc large" style={{ "--character": selected.body, "--accent": selected.accent } as React.CSSProperties}>{selected.icon}</span><div><p>NGƯỜI CHẠY ĐANG CHỌN</p><h2>{selected.name}</h2><span>{selected.tagline}</span></div></div><div className="runner-perks"><span>↥ Nhảy {selected.jumpForce.toFixed(1)}</span><span>★ Thưởng +{Math.round((selected.starBonus - 1) * 100)}%</span><span>◒ Trượt {selected.slideDuration.toFixed(2)}s</span></div></div>
              <div className="character-grid">
                {CHARACTERS.map((character) => (
                  <button key={character.id} onClick={() => { setSelectedId(character.id); send({ type: "select", characterId: character.id }); }} className={`character-card ${selectedId === character.id ? "selected" : ""}`} style={{ "--character": character.body, "--accent": character.accent } as React.CSSProperties}>
                    <span className="portrait-disc">{character.icon}</span><span>{character.name}</span>
                  </button>
                ))}
              </div>
              <button className="practice-button" onClick={() => send({ type: "practice", characterId: selectedId })}><Play size={15} fill="currentColor" /> Luyện tập 3 bước</button>
              <button className="play-button" onClick={() => send({ type: "start", characterId: selectedId })}><Play size={20} fill="currentColor" /> Chạy cùng {selected.name}</button>
              <p className="fan-note">Nhạc nền sẽ bắt đầu khi bạn bấm chạy; có thể bật/tắt bằng nút loa.</p>
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

      {tutorialOpen && snapshot.status === "menu" && (
        <div className="tutorial-scrim">
          <section className="tutorial-panel guide-v2" aria-label="Hướng dẫn chơi">
            <header className="guide-v2-head">
              <div><p>ĐƯỜNG CHẠY MÂY · HƯỚNG DẪN NHANH</p><h2>Nhìn hình, làm đúng.</h2></div>
              <div className="guide-rule-pill">★ Một vật · Một hành động</div>
            </header>
            <p className="guide-v2-intro">Ba thẻ dưới đây là <strong>đúng những vật</strong> đang xuất hiện trong đường chạy. Không cần đoán: màu sắc, chiều cao và phím bấm luôn giống nhau.</p>
            <div className="guide-action-grid">
              <article className="guide-action-card collect-card"><div className="guide-prop-frame"><img src={GUIDE_STAR_URL} alt="Sao điều ước có vòng mint" /></div><div className="guide-action-copy"><span>01 · LẤY</span><h3>Sao điều ước</h3><p>Đổi làn để chạm vào sao. Sao tăng combo.</p><div className="key-caps"><kbd>←</kbd><kbd>→</kbd><b>Đổi làn</b></div></div></article>
              <article className="guide-action-card jump-card"><div className="guide-prop-frame"><img src={GUIDE_JUMP_URL} alt="Đệm dâu hồng thấp" /></div><div className="guide-action-copy"><span>02 · NHẢY</span><h3>Đệm dâu thấp</h3><p>Vật thấp ở mặt đường: chỉ việc nhảy qua.</p><div className="key-caps"><kbd>SPACE</kbd><kbd>↑</kbd><b>Nhảy qua</b></div></div></article>
              <article className="guide-action-card slide-card"><div className="guide-prop-frame"><img src={GUIDE_SLIDE_URL} alt="Cổng mây cao có khoảng hở bên dưới" /></div><div className="guide-action-copy"><span>03 · TRƯỢT</span><h3>Cổng mây cao</h3><p>Mây treo cao có khoảng hở: trượt dưới cổng.</p><div className="key-caps"><kbd>↓</kbd><b>Trượt dưới</b></div></div></article>
            </div>
            <footer className="guide-v2-footer"><span>Luật nhớ nhanh: <b>vật thấp nhảy · vật cao trượt · sao thì lấy</b></span><button className="play-button" onClick={() => setTutorialOpen(false)}>Đã rõ, chọn người chạy <ChevronRight size={19} /></button></footer>
          </section>
        </div>
      )}
    </div>
  );
}
