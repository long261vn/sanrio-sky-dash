/**
 * Mây Bông & Kẹo Ngọt: HUD postcard dùng cream, blueberry ink và Sky Pudding.
 * Các nút phản hồi tức thì; lớp UI chỉ giao tiếp với gameplay bằng CustomEvent.
 */
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, CircleHelp, Gauge, Pause, Play, RotateCcw, Sparkles, Trophy, TriangleAlert, Volume2, VolumeX, Zap } from "lucide-react";
import { CHARACTERS, type CharacterId, type GameCommand, type GameSnapshot } from "@/game/types";

const LOGO_URL = "/manus-storage/sky-dash-logo-retry_53835e27.png";
const TARGET_URL = "/manus-storage/sky-dash-menu-art-retry_f2351b45.png";
const TUTORIAL_URL = "/manus-storage/hana-tutorial-card-v2_79a9bc21.png";

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
  message: "Hana đã sẵn sàng chạy vào điều ước.",
  isNewRecord: false,
  audioEnabled: true,
  difficultyLevel: 1,
  speed: 10,
};

function send(command: GameCommand) {
  window.dispatchEvent(new CustomEvent<GameCommand>("skydash:command", { detail: command }));
}

export default function SkyDashHud() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [selectedId, setSelectedId] = useState<CharacterId>("cinnamoroll");
  const [tutorialOpen, setTutorialOpen] = useState(false);

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
            <div className="game-meta"><div className="game-progress"><span>Mục tiêu {snapshot.missionProgress}/10 sao</span><b><Gauge size={14} /> Cấp {snapshot.difficultyLevel} · {snapshot.speed} km/h</b>{snapshot.shieldSeconds > 0 && <em><Zap size={13} /> Khiên {snapshot.shieldSeconds}s</em>}</div><div className="game-actions"><span>{snapshot.distance}m</span><button className="sound-button" onClick={() => send({ type: "toggleAudio" })} aria-label={snapshot.audioEnabled ? "Tắt âm thanh" : "Bật âm thanh"}>{snapshot.audioEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</button><button className="pause-button" onClick={() => send({ type: "pause" })} aria-label="Tạm dừng"><Pause size={18} /></button></div></div>
          </div>
          {snapshot.message && <div className="sky-toast">{snapshot.message}</div>}
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
              <button className="menu-sound-toggle" onClick={() => send({ type: "toggleAudio" })} aria-label={snapshot.audioEnabled ? "Tắt âm thanh" : "Bật âm thanh"}>{snapshot.audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}<span>{snapshot.audioEnabled ? "Âm thanh bật" : "Âm thanh tắt"}</span></button>
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
              <button className="play-button" onClick={() => send({ type: "start", characterId: selectedId })}><Play size={20} fill="currentColor" /> Chạy cùng {selected.name}</button>
              <p className="fan-note">Nhạc nền bắt đầu sau khi bạn chọn chạy.</p>
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
          <section className="tutorial-panel" aria-label="Hướng dẫn chơi">
            <div className="tutorial-copy">
              <p className="eyebrow">HƯỚNG DẪN NHANH</p>
              <h2>Ba dấu hiệu để<br />chạy thật xa.</h2>
              <p>Đừng chỉ nhìn màu sắc. Hana dùng <strong>vòng sáng mint</strong> cho phần thưởng và <strong>biển cảnh báo navy–berry</strong> cho mọi vật cản.</p>
              <div className="lesson-list">
                <div className="lesson reward"><Sparkles size={20} /><span><b>NHẶT</b> · Sao mint/gold và bubble cầu vồng là vật phẩm tốt.</span></div>
                <div className="lesson hazard"><TriangleAlert size={20} /><span><b>NÉ</b> · Khung navy–berry là cảnh báo: nhảy qua macaron, trượt dưới mây giông.</span></div>
                <div className="lesson move"><Gauge size={20} /><span><b>ĐỔI LÀN</b> · Dùng ← →; càng xa, tốc độ và số chướng ngại càng tăng.</span></div>
              </div>
              <button className="play-button" onClick={() => setTutorialOpen(false)}>Rõ rồi, quay lại bộ sưu tập <ChevronRight size={19} /></button>
              <button className="quiet-button" onClick={() => setTutorialOpen(false)}>Bỏ qua lần này</button>
            </div>
            <div className="tutorial-art-wrap"><img src={TUTORIAL_URL} className="tutorial-art" alt="Hana đổi làn, nhảy qua vật cản và trượt dưới mây giông" /><div className="tutorial-callout mint">Vật phẩm tốt</div><div className="tutorial-callout berry">Cảnh báo nguy hiểm</div></div>
          </section>
        </div>
      )}
    </div>
  );
}
