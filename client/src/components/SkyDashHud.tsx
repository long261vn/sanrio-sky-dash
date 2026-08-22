/**
 * Mây Bông & Kẹo Ngọt: HUD postcard dùng cream, blueberry ink và Sky Pudding.
 * Các nút phản hồi tức thì; lớp UI chỉ giao tiếp với gameplay bằng CustomEvent.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, CircleHelp, Crown, Gauge, Pause, Play, Trophy, Volume2, VolumeX, X, Zap } from "lucide-react";
import { CHARACTERS, type CharacterId, type GameCommand, type GameSnapshot } from "@/game/types";
import { assetUrl } from "@/lib/assets";
import { trpc } from "@/lib/trpc";
import { canStartSkyDashRun, needsLeaderboardName } from "@shared/runFlow";

const LOGO_URL = assetUrl("sky-dash-logo-retry_53835e27.png");
const TARGET_URL = assetUrl("sky-dash-menu-art-retry_f2351b45.png");
const GUIDE_STAR_URL = assetUrl("hana-star-reward_f0db88ad.png");
const GUIDE_JUMP_URL = assetUrl("hana-low-jump-cushion_8c9af18d.png");
const GUIDE_SLIDE_URL = assetUrl("hana-high-slide-gate_b3d23f2c.png");
const GUIDE_SHIELD_URL = "/manus-storage/sky-dash-rainbow-shield-clean_d2fe8879.png";
const GUIDE_GUST_URL = "/manus-storage/sky-dash-mint-gust-clean_688581d2.png";
const PLAYER_ID_KEY = "hanaSkyDashPlayerId";
const PLAYER_NAME_KEY = "hanaSkyDashPlayerName";

type CompletedRun = GameSnapshot & { runId: number };

function getPlayerId() {
  const current = window.localStorage.getItem(PLAYER_ID_KEY);
  if (current) return current;
  const created = crypto.randomUUID();
  window.localStorage.setItem(PLAYER_ID_KEY, created);
  return created;
}

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
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [playerName, setPlayerName] = useState(() => window.localStorage.getItem(PLAYER_NAME_KEY) ?? "");
  const [nameError, setNameError] = useState("");
  const [completedRun, setCompletedRun] = useState<CompletedRun | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "needsName" | "saving" | "ranked" | "outside" | "error">("idle");
  const [recentRank, setRecentRank] = useState<number | null>(null);
  const [lastSubmissionImproved, setLastSubmissionImproved] = useState<boolean | null>(null);
  const snapshotRef = useRef(initialSnapshot);
  const runIdRef = useRef(0);
  const leaderboard = trpc.leaderboard.top30.useQuery(undefined, { staleTime: 0, refetchOnWindowFocus: true });
  const leaderboardUtils = trpc.useUtils();
  const submitScore = trpc.leaderboard.submit.useMutation({
    onSuccess: async (result) => {
      leaderboardUtils.leaderboard.top30.setData(undefined, { seasonKey: result.seasonKey, rows: result.rows });
      await leaderboard.refetch();
      setRecentRank(result.rank);
      setLastSubmissionImproved(result.improved);
      setSaveStatus(result.enteredTop30 ? "ranked" : "outside");
      setNameError("");
      if (result.enteredTop30) setLeaderboardOpen(true);
    },
    onError: (error) => {
      setSaveStatus("error");
      setNameError(error.message);
    },
  });

  useEffect(() => {
    const onState = (event: Event) => {
      const next = (event as CustomEvent<GameSnapshot>).detail;
      if (next.status === "gameover" && snapshotRef.current.status !== "gameover" && !next.isPractice) {
        runIdRef.current += 1;
        setCompletedRun({ ...next, runId: runIdRef.current });
      }
      snapshotRef.current = next;
      setSnapshot(next);
      setSelectedId(next.characterId);
      if (next.status === "playing") setTutorialOpen(false);
    };
    window.addEventListener("skydash:state", onState);
    return () => window.removeEventListener("skydash:state", onState);
  }, []);

  useEffect(() => {
    if (!completedRun) return;
    const cleanName = playerName.trim();
    if (needsLeaderboardName(cleanName)) {
      setSaveStatus("needsName");
      setNameError("");
      return;
    }
    submitCompletedRun(completedRun);
  // A completed run has one immutable id, so the mutation is triggered exactly once per run.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedRun?.runId]);

  const selected = useMemo(() => CHARACTERS.find((item) => item.id === selectedId) ?? CHARACTERS[0], [selectedId]);
  const isRunning = snapshot.status === "playing";
  const leaderboardRows = leaderboard.data?.rows ?? [];

  const updatePlayerName = (value: string) => {
    setPlayerName(value);
    window.localStorage.setItem(PLAYER_NAME_KEY, value);
  };
  const createNewProfile = () => {
    window.localStorage.setItem(PLAYER_ID_KEY, crypto.randomUUID());
    window.localStorage.removeItem(PLAYER_NAME_KEY);
    setPlayerName("");
    setNameError("Đã tạo hồ sơ mới. Nhập tên mới để có một kỷ lục riêng nhé.");
  };
  const submitCompletedRun = (run = completedRun) => {
    if (!run) return;
    const cleanName = playerName.trim();
    if (needsLeaderboardName(cleanName)) {
      setSaveStatus("needsName");
      setNameError("Nhập tên từ 2–20 ký tự để ghi hạng nhé.");
      return;
    }
    window.localStorage.setItem(PLAYER_NAME_KEY, cleanName);
    setNameError("");
    setSaveStatus("saving");
    submitScore.mutate({
      playerId: getPlayerId(),
      playerName: cleanName,
      runnerId: run.characterId,
      score: run.score,
      stars: run.stars,
      distance: run.distance,
    });
  };
  const startRun = () => {
    if (!canStartSkyDashRun()) return;
    setCompletedRun(null);
    setNameError("");
    setRecentRank(null);
    setLastSubmissionImproved(null);
    setSaveStatus("idle");
    send({ type: "start", characterId: selectedId });
  };
  const openLeaderboard = () => {
    leaderboard.refetch();
    setLeaderboardOpen(true);
  };
  const returnToMenu = () => {
    setLeaderboardOpen(false);
    setCompletedRun(null);
    setSaveStatus("idle");
    setRecentRank(null);
    setLastSubmissionImproved(null);
    send({ type: "menu" });
  };

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
            <div className="game-meta"><div className="game-progress"><span>{snapshot.isPractice ? `Luyện tập ${snapshot.practiceStep + 1}/3` : `Sao ${snapshot.missionProgress}/10 · thưởng 250 điểm`}</span><b><Gauge size={14} /> {snapshot.isPractice ? "Đường mây an toàn" : `Cấp ${snapshot.difficultyLevel} · ${snapshot.speed} km/h`}</b>{snapshot.shieldSeconds > 0 && <em><Zap size={13} /> Khiên {snapshot.shieldSeconds}s</em>}</div><div className="game-actions"><span>{snapshot.distance}m</span><button className="sound-button" onClick={() => send({ type: "toggleAudio" })} aria-label={snapshot.audioEnabled ? "Tắt âm thanh" : "Bật âm thanh"}>{snapshot.audioEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</button><button className="pause-button" onClick={() => send({ type: "pause" })} aria-label="Tạm dừng"><Pause size={18} /></button></div></div>
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
              <div className="player-profile"><label><span>TÊN NGƯỜI CHƠI · ĐỂ LƯU HẠNG</span><input value={playerName} onChange={(event) => updatePlayerName(event.target.value.slice(0, 20))} placeholder="Có thể nhập sau khi chơi" maxLength={20} /></label><div className="profile-actions"><button className="new-profile-button" onClick={createNewProfile}>Hồ sơ mới</button><button className="leaderboard-button" onClick={openLeaderboard}><Trophy size={16} /> Top 30 tuần</button></div><small className="profile-note">Một hồ sơ giữ một kỷ lục tuần; đổi tên cập nhật dòng hiện tại, còn “Hồ sơ mới” tạo kỷ lục riêng.</small></div>
              {nameError && <p className="score-error menu-name-error">{nameError}</p>}
              <div className="character-grid">
                {CHARACTERS.map((character) => (
                  <button key={character.id} onClick={() => { setSelectedId(character.id); send({ type: "select", characterId: character.id }); }} className={`character-card ${selectedId === character.id ? "selected" : ""}`} style={{ "--character": character.body, "--accent": character.accent } as React.CSSProperties}>
                    <span className="portrait-disc">{character.icon}</span><span>{character.name}</span>
                  </button>
                ))}
              </div>
              <button className="practice-button" onClick={() => send({ type: "practice", characterId: selectedId })}><Play size={15} fill="currentColor" /> Luyện tập 3 bước</button>
              <button className="play-button" onClick={startRun}><Play size={20} fill="currentColor" /> Chạy cùng {selected.name}</button>
              <p className="fan-note">Nhạc nền sẽ bắt đầu khi bạn bấm chạy; có thể bật/tắt bằng nút loa.</p>
            </div>
          </section>
        </div>
      )}

      {snapshot.status === "paused" && (
        <div className="screen-scrim compact-scrim"><section className="pause-panel"><img src={LOGO_URL} alt="" /><p>NHỊP MÂY ĐANG TẠM DỪNG</p><h2>Hít một hơi thật êm.</h2><button className="play-button" onClick={() => send({ type: "resume" })}><Play size={19} fill="currentColor" /> Bay tiếp nào</button><button className="quiet-button" onClick={() => send({ type: "menu" })}>Về bộ sưu tập</button></section></div>
      )}

      {snapshot.status === "gameover" && (
        <div className="screen-scrim compact-scrim"><section className="results-panel auto-save-panel"><div className="result-badge">{snapshot.isNewRecord ? "★ KỶ LỤC MỚI" : "☁ CHUYẾN BAY HOÀN TẤT"}</div><h2>{snapshot.isNewRecord ? "Bầu trời vỗ tay!" : "Mây vẫn chờ bạn."}</h2><p>{snapshot.message}</p><div className="result-stats"><div><span>Điểm bay</span><strong>{snapshot.score.toLocaleString("vi-VN")}</strong></div><div><span>Sao điều ước</span><strong>★ {snapshot.stars}</strong></div><div><span>Quãng đường</span><strong>{snapshot.distance}m</strong></div></div><div className={`auto-save-status ${saveStatus}`}><Trophy size={18} /><div>{saveStatus === "needsName" && <><b>Đặt tên để ghi hạng nhé.</b><span>Bạn vẫn có thể chơi tự do; chỉ cần tên khi muốn vào Top 30.</span></>}{saveStatus === "saving" && <><b>Đang đồng bộ hành trình...</b><span>Điểm sẽ tự lưu dưới tên {playerName.trim()}.</span></>}{saveStatus === "ranked" && <><b>{lastSubmissionImproved ? (recentRank === 1 ? "Bạn đang dẫn đầu!" : `Bạn đạt hạng #${recentRank}!`) : `Kỷ lục của bạn đang ở hạng #${recentRank}.`}</b><span>Bảng xếp hạng đã xếp lại. Bạn chọn khi nào quay về màn đầu.</span></>}{saveStatus === "outside" && <><b>Chưa vào Top 30 tuần này.</b><span>Hãy cố gắng thêm một chuyến bay nữa ở lượt sau nhé.</span></>}{saveStatus === "error" && <><b>Chưa thể đồng bộ điểm.</b><span>{nameError || "Kiểm tra kết nối rồi thử lại ở lượt sau."}</span></>}{saveStatus === "idle" && <><b>Chuẩn bị đồng bộ điểm...</b><span>Đợi một nhịp nhé.</span></>}</div></div>{(saveStatus === "needsName" || saveStatus === "error") && <div className="score-save"><label><span>TÊN HIỂN THỊ TRÊN TOP 30</span><input value={playerName} onChange={(event) => updatePlayerName(event.target.value.slice(0, 20))} placeholder="Ví dụ: Mây Nhỏ" maxLength={20} autoFocus /></label><button className="leaderboard-button" disabled={submitScore.isPending} onClick={() => submitCompletedRun()}>{submitScore.isPending ? "Đang lưu..." : "Lưu & xem hạng"}</button></div>}{nameError && <p className="score-error">{nameError}</p>}{saveStatus !== "saving" && <div className="result-actions">{saveStatus !== "needsName" && saveStatus !== "error" && <button className="leaderboard-button" onClick={openLeaderboard}><Trophy size={16} /> {saveStatus === "ranked" ? "Mở lại Top 30" : "Xem Top 30"}</button>}<button className="play-button" onClick={returnToMenu}>Về màn hình đầu</button></div>}</section></div>
      )}

      {leaderboardOpen && (
        <div className="tutorial-scrim leaderboard-scrim"><section className="leaderboard-panel" aria-label="Bảng xếp hạng Top 30"><header><div><p><Crown size={15} /> BẦU TRỜI VINH DANH</p><h2>Top 30 tuần</h2><span>Mùa bắt đầu {leaderboard.data?.seasonKey ?? "thứ Bảy này"} · kéo để xem đủ 30 hạng.</span></div><button className="leaderboard-close" onClick={() => setLeaderboardOpen(false)} aria-label="Đóng bảng xếp hạng"><X size={20} /></button></header>{leaderboard.isLoading ? <div className="leaderboard-empty">Đang gọi các vì sao về bảng xếp hạng...</div> : <ol className="leaderboard-list" aria-label="30 hạng của tuần">{Array.from({ length: 30 }, (_, index) => { const row = leaderboardRows[index]; const rank = index + 1; return row ? <li key={`${row.rank}-${row.playerName}-${row.score}`} className={`${row.rank <= 3 ? `rank-${row.rank}` : ""} ${row.rank === recentRank && row.playerName === playerName.trim() ? "just-ranked" : ""}`}><b>{row.rank}</b><span className="rank-runner">{CHARACTERS.find((character) => character.id === row.runnerId)?.icon ?? "★"}</span><strong>{row.playerName}</strong><em>{row.distance}m · ★ {row.stars}</em><mark>{row.score.toLocaleString("vi-VN")}</mark></li> : <li className="rank-placeholder" key={`empty-rank-${rank}`}><b>{rank}</b><span className="rank-runner">☁</span><strong>Đang chờ chuyến bay</strong><em>Chưa có điểm</em><mark>—</mark></li>; })}</ol>}<footer><span>{leaderboard.isFetching ? "Đang xếp lại bảng điểm..." : recentRank ? `Chuyến bay của bạn đang ở hạng #${recentRank}.` : "Mỗi người chơi giữ một kỷ lục cao nhất trong tuần; đổi tên sẽ cập nhật dòng của bạn."}</span><button className="play-button" onClick={returnToMenu}>Về màn hình đầu</button></footer></section></div>
      )}

      {tutorialOpen && snapshot.status === "menu" && (
        <div className="tutorial-scrim">
          <section className="tutorial-panel guide-v2" aria-label="Hướng dẫn chơi">
            <header className="guide-v2-head">
              <div><p>ĐƯỜNG CHẠY MÂY · HƯỚNG DẪN NHANH</p><h2>Nhìn hình, làm đúng.</h2></div>
              <div className="guide-rule-pill">★ Một vật · Một hành động</div>
            </header>
            <p className="guide-v2-intro">Năm thẻ dưới đây là <strong>đúng những vật</strong> đang xuất hiện trong đường chạy. Không cần đoán: màu sắc, chiều cao và cách nhận luôn giống nhau.</p>
            <div className="guide-action-grid">
              <article className="guide-action-card collect-card"><div className="guide-prop-frame"><img src={GUIDE_STAR_URL} alt="Sao điều ước có vòng mint" /></div><div className="guide-action-copy"><span>01 · LẤY</span><h3>Sao điều ước</h3><p>Đổi làn để lấy: +30 × combo, combo +0.2. Đủ 10 sao nhận thêm 250 điểm.</p><div className="key-caps"><kbd>←</kbd><kbd>→</kbd><b>Đổi làn</b></div></div></article>
              <article className="guide-action-card jump-card"><div className="guide-prop-frame"><img src={GUIDE_JUMP_URL} alt="Đệm dâu hồng thấp" /></div><div className="guide-action-copy"><span>02 · NHẢY</span><h3>Đệm dâu thấp</h3><p>Vật thấp ở mặt đường: chỉ việc nhảy qua.</p><div className="key-caps"><kbd>SPACE</kbd><kbd>↑</kbd><b>Nhảy qua</b></div></div></article>
              <article className="guide-action-card slide-card"><div className="guide-prop-frame"><img src={GUIDE_SLIDE_URL} alt="Cổng mây cao có khoảng hở bên dưới" /></div><div className="guide-action-copy"><span>03 · TRƯỢT</span><h3>Cổng mây cao</h3><p>Mây treo cao có khoảng hở: trượt dưới cổng.</p><div className="key-caps"><kbd>↓</kbd><b>Trượt dưới</b></div></div></article>
              <article className="guide-action-card shield-card"><div className="guide-prop-frame"><img src={GUIDE_SHIELD_URL} alt="Khiên cầu vồng trong bong bóng xanh" /></div><div className="guide-action-copy"><span>04 · BẢO VỆ</span><h3>Khiên cầu vồng</h3><p>Đổi làn để chạm vào bong bóng. Khiên che được một va chạm trong thời gian ngắn.</p><div className="key-caps"><kbd>←</kbd><kbd>→</kbd><b>Chạm để lấy</b></div></div></article>
              <article className="guide-action-card gust-card"><div className="guide-prop-frame"><img src={GUIDE_GUST_URL} alt="Vòng gió mint với sao vàng ở giữa" /></div><div className="guide-action-copy"><span>05 · TĂNG TỐC</span><h3>Vòng gió mint</h3><p>Đổi làn để chạm vào vòng gió: +90 × combo và combo tăng thêm 0.5.</p><div className="key-caps"><kbd>←</kbd><kbd>→</kbd><b>Chạm để lấy</b></div></div></article>
            </div>
            <footer className="guide-v2-footer"><span>Luật nhớ nhanh: <b>vật thấp nhảy · vật cao trượt · sao/khiên/gió thì đổi làn để lấy</b></span><button className="play-button" onClick={() => setTutorialOpen(false)}>Đã rõ, chọn người chạy <ChevronRight size={19} /></button></footer>
          </section>
        </div>
      )}
    </div>
  );
}
