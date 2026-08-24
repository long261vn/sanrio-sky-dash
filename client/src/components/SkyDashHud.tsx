/**
 * Mây Bông & Kẹo Ngọt: HUD postcard dùng cream, blueberry ink và Sky Pudding.
 * Các nút phản hồi tức thì; lớp UI chỉ giao tiếp với gameplay bằng CustomEvent.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, CircleHelp, Crown, Download, Gauge, ImageDown, Music2, Pause, Play, Share2, Sparkles, Trophy, Volume2, VolumeX, X, Zap } from "lucide-react";
import { CHARACTERS, type CharacterId, type GameCommand, type GameSnapshot } from "@/game/types";
import { assetUrl } from "@/lib/assets";
import { trpc } from "@/lib/trpc";
import { canStartSkyDashRun, needsLeaderboardName } from "@shared/runFlow";
import { SCORE_RULES } from "@shared/scoring";
import { createAchievementCard, downloadAchievementCard, type AchievementCardInput } from "@/lib/achievementCard";
import { MascotPreview3D } from "@/components/MascotPreview3D";

const LOGO_URL = assetUrl("sky-dash-logo-retry_53835e27.png");
const TARGET_URL = assetUrl("sky-dash-menu-art-retry_f2351b45.png");
const GUIDE_JUMP_URL = assetUrl("hana-low-jump-cushion_8c9af18d.png");
const GUIDE_SLIDE_URL = assetUrl("hana-high-slide-gate_b3d23f2c.png");
const GUIDE_SHIELD_URL = assetUrl("sky-dash-rainbow-shield-clean_d2fe8879.png");
const GUIDE_GUST_URL = assetUrl("sky-dash-mint-gust-clean_688581d2.png");
const GUIDE_STAR_URL = assetUrl("hana-star-reward_f0db88ad.png");
const PLAYER_ID_KEY = "hanaSkyDashPlayerId";
const PLAYER_NAME_KEY = "hanaSkyDashPlayerName";
const MUSIC_KEY = "hanaSkyDashMusicEnabled";
const EFFECTS_KEY = "hanaSkyDashEffectsEnabled";

function preferenceEnabled(key: string) {
  try {
    return window.localStorage.getItem(key) !== "false";
  } catch {
    return true;
  }
}

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
  musicEnabled: preferenceEnabled(MUSIC_KEY),
  effectsEnabled: preferenceEnabled(EFFECTS_KEY),
  difficultyLevel: 1,
  speed: 10,
  actionHint: null,
  isPractice: false,
  practiceStep: 0,
};

function send(command: GameCommand) {
  window.dispatchEvent(new CustomEvent<GameCommand>("skydash:command", { detail: command }));
}

function getScoreGreeting(score: number) {
  if (score >= 3_000) return { title: "Bầu trời bùng sáng!", body: "Một chuyến bay xuất sắc — phản xạ của bạn đang ở đẳng cấp ngôi sao." };
  if (score >= 1_500) return { title: "Bạn bay rất ấn tượng!", body: "Bạn đã giữ nhịp tốt qua một đường chạy đầy thử thách." };
  if (score >= 700) return { title: "Chuyến bay rất khá!", body: "Bạn đã nắm đúng nhịp nhảy, trượt và đổi làn." };
  return { title: "Khởi đầu thật đáng yêu!", body: "Mỗi lượt bay giúp bạn quen đường mây hơn một chút." };
}

function getRankPraise(rank: number | null) {
  if (rank === 1) return "Bạn đang dẫn đầu Top 20 — thật tuyệt vời!";
  if (rank !== null && rank <= 3) return `Hạng #${rank}: bạn đang ở bục vinh danh Top 3!`;
  if (rank !== null && rank <= 10) return `Hạng #${rank}: một vị trí rất mạnh trong Top 10!`;
  return `Hạng #${rank}: bạn đã chinh phục Top 20 tuần này!`;
}

function getOutsideTop20Message(score: number) {
  if (score >= 1_500) return "Chỉ thêm một nhịp phản xạ nữa là bạn có thể vào Top 20.";
  if (score >= 700) return "Bạn đang tiến gần Top 20 — thử giữ nhịp qua thêm vài cổng mây nhé.";
  return "Cố gắng thêm một chuyến bay; đổi làn lấy vật phẩm và vượt cổng đúng lúc sẽ giúp điểm tăng nhanh hơn.";
}

function portraitUrl(portrait: string) {
  return assetUrl(portrait.split("/").pop() ?? portrait);
}

function CharacterPortrait({ character, className }: { character: (typeof CHARACTERS)[number]; className: string }) {
  if (className.includes("selected-runner-portrait")) return <MascotPreview3D character={character} className={className} />;
  const [failed, setFailed] = useState(false);
  return <span className={`character-portrait ${className} ${failed ? "fallback" : ""}`} aria-label={`Ảnh mặt trước ${character.name}`} style={{ "--character": character.body, "--accent": character.accent } as React.CSSProperties}><img src={portraitUrl(character.portrait)} alt={`Minh hoạ mặt trước ${character.name}`} onError={() => setFailed(true)} /><b aria-hidden="true">{character.icon}</b></span>;
}

export default function SkyDashHud() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [selectedId, setSelectedId] = useState<CharacterId>("cinnamoroll");
  const [hasChosenCharacter, setHasChosenCharacter] = useState(false);
  const [menuStep, setMenuStep] = useState<"welcome" | "setup">(() => new URLSearchParams(window.location.search).has("setup") ? "setup" : "welcome");
  const [tutorialOpen, setTutorialOpen] = useState(() => new URLSearchParams(window.location.search).has("guide"));
  const [tutorialStep, setTutorialStep] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(() => new URLSearchParams(window.location.search).has("leaderboard"));
  const [playerName, setPlayerName] = useState(() => window.localStorage.getItem(PLAYER_NAME_KEY) ?? "");
  const [nameError, setNameError] = useState("");
  const [completedRun, setCompletedRun] = useState<CompletedRun | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "needsName" | "saving" | "ranked" | "outside" | "error">("idle");
  const [recentRank, setRecentRank] = useState<number | null>(null);
  const [recentEntryId, setRecentEntryId] = useState<number | null>(null);
  const [lastSubmissionImproved, setLastSubmissionImproved] = useState<boolean | null>(null);
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied" | "manual">("idle");
  const [cardStatus, setCardStatus] = useState<"idle" | "creating" | "downloaded" | "shared" | "error">("idle");
  const [menuAudioHint, setMenuAudioHint] = useState("");
  const snapshotRef = useRef(initialSnapshot);
  const runIdRef = useRef(0);
  const leaderboardListRef = useRef<HTMLOListElement>(null);
  const leaderboard = trpc.leaderboard.top20.useQuery(undefined, { staleTime: 0, refetchOnWindowFocus: true });
  const leaderboardUtils = trpc.useUtils();
  const submitScore = trpc.leaderboard.submit.useMutation({
    onSuccess: async (result) => {
      leaderboardUtils.leaderboard.top20.setData(undefined, { seasonKey: result.seasonKey, rows: result.rows });
      await leaderboard.refetch();
      setRecentRank(result.rank);
      setRecentEntryId(result.entryId);
      setLastSubmissionImproved(true);
      setSaveStatus(result.enteredTop20 ? "ranked" : "outside");
      setNameError("");
      if (result.enteredTop20) setLeaderboardOpen(true);
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
    const onAudioState = (event: Event) => {
      const next = (event as CustomEvent<{ musicEnabled: boolean; effectsEnabled: boolean; message?: string; musicStarted?: boolean }>).detail;
      setSnapshot((current) => ({ ...current, musicEnabled: next.musicEnabled, effectsEnabled: next.effectsEnabled, message: next.message ?? current.message }));
      if (next.message) setMenuAudioHint(next.message);
    };
    window.addEventListener("skydash:audio-state", onAudioState);
    return () => window.removeEventListener("skydash:audio-state", onAudioState);
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

  useEffect(() => {
    if (!leaderboardOpen || recentEntryId === null || !leaderboard.data?.rows.length) return;
    const highlighted = leaderboardListRef.current?.querySelector<HTMLElement>(`[data-entry-id="${recentEntryId}"]`);
    if (highlighted && typeof highlighted.scrollIntoView === "function") {
      highlighted.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }, [leaderboard.data?.rows.length, leaderboardOpen, recentEntryId]);

  const selected = useMemo(() => CHARACTERS.find((item) => item.id === selectedId) ?? CHARACTERS[0], [selectedId]);
  const isRunning = snapshot.status === "playing";
  const leaderboardRows = leaderboard.data?.rows ?? [];
  const skyRecord = leaderboardRows[0]?.score ?? 0;
  const isNameReady = !needsLeaderboardName(playerName);
  const canLaunch = canStartSkyDashRun(playerName);

  useEffect(() => {
    const isLocked = menuStep === "setup" && !isNameReady;
    const root = document.documentElement;
    const lockedAreas = document.querySelectorAll<HTMLElement>(
      ".setup-character-step, .setup-selected, .mobile-setup-tip, .character-grid, .setup-actions, .setup-requirements",
    );

    root.classList.toggle("skydash-name-pending", isLocked);
    root.classList.toggle("skydash-name-ready", menuStep === "setup" && isNameReady);
    lockedAreas.forEach((area) => {
      area.toggleAttribute("inert", isLocked);
      area.setAttribute("aria-hidden", isLocked ? "true" : "false");
    });

    let focusFrame = 0;
    if (isLocked) {
      focusFrame = window.requestAnimationFrame(() => document.querySelector<HTMLInputElement>(".setup-name input")?.focus());
    }

    return () => {
      window.cancelAnimationFrame(focusFrame);
      root.classList.remove("skydash-name-pending", "skydash-name-ready");
      lockedAreas.forEach((area) => {
        area.removeAttribute("inert");
        area.removeAttribute("aria-hidden");
      });
    };
  }, [isNameReady, menuStep]);
  const guidePages = [
    { eyebrow: "NHÓM 1 / 2 · VẬT PHẨM NÊN LẤY", title: "Đổi làn để nhận quà.", summary: "Những vật sáng này không gây hại. Chạm đúng làn để nhận công dụng riêng.", shortRule: "Vật sáng: đổi làn để lấy", items: [{ name: "Sao xu", detail: `+${SCORE_RULES.starBasePoints} điểm cố định`, image: GUIDE_STAR_URL, alt: "Sao xu vàng" }, { name: "Khiên cầu vồng", detail: "Chặn 1 va chạm", image: GUIDE_SHIELD_URL, alt: "Khiên cầu vồng" }, { name: "Vòng gió mint", detail: `+${SCORE_RULES.gustBasePoints} điểm cố định`, image: GUIDE_GUST_URL, alt: "Vòng gió mint" }] },
    { eyebrow: "NHÓM 2 / 2 · CHƯỚNG NGẠI CẦN VƯỢT", title: "Nhìn độ cao, làm đúng.", summary: "Vật chặn đường luôn có biển cảnh báo. Hành động đúng giúp bạn vượt qua và nhận điểm.", shortRule: "Vật thấp: nhảy · Cổng cao: trượt", items: [{ name: "Đệm dâu thấp", detail: `Nhảy qua · +${SCORE_RULES.hurdleClearPoints} điểm`, image: GUIDE_JUMP_URL, alt: "Đệm dâu hồng thấp" }, { name: "Cổng mây cao", detail: `Trượt dưới · +${SCORE_RULES.hurdleClearPoints} điểm`, image: GUIDE_SLIDE_URL, alt: "Cổng mây cao có khoảng hở bên dưới" }] },
  ];
  const activeGuidePage = guidePages[tutorialStep];
  const scoreGreeting = getScoreGreeting(snapshot.score);

  const updatePlayerName = (value: string) => {
    setPlayerName(value);
    window.localStorage.setItem(PLAYER_NAME_KEY, value);
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
    if (!canStartSkyDashRun(playerName)) {
      setNameError("Nhập tên từ 2–20 ký tự trước khi chạy nhé.");
      return;
    }
    setCompletedRun(null);
    setNameError("");
    setRecentRank(null);
    setRecentEntryId(null);
    setLastSubmissionImproved(null);
    setLastSubmissionImproved(null);
    setNameError("");
    window.dispatchEvent(new Event("skydash:prepare"));
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
    setRecentEntryId(null);
    setLastSubmissionImproved(null);
    setHasChosenCharacter(false);
    setMenuStep("welcome");
    send({ type: "menu" });
  };
  const shareResult = async () => {
    const runnerName = playerName.trim() || selected.name;
    const rankLine = recentRank ? ` và đạt hạng #${recentRank} Top 20 tuần` : "";
    const text = `${runnerName} vừa đạt ${snapshot.score.toLocaleString("vi-VN")} điểm, bay ${snapshot.distance}m${rankLine} trong Chạy Đua Cùng Hana!`;
    const url = `${window.location.origin}${window.location.pathname}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Chạy Đua Cùng Hana", text, url });
        setShareStatus("shared");
      } catch {
        setShareStatus("idle");
      }
      return;
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareStatus("copied");
    } catch {
      setShareStatus("manual");
    }
  };
  const buildAchievementCard = () => {
    const run = completedRun ?? snapshot;
    const runner = CHARACTERS.find((character) => character.id === run.characterId) ?? selected;
    const input: AchievementCardInput = {
      playerName: playerName.trim() || runner.name,
      characterIcon: runner.icon,
      characterName: runner.name,
      characterPortrait: portraitUrl(runner.portrait),
      characterBody: runner.body,
      characterAccent: runner.accent,
      score: run.score,
      distance: run.distance,
      level: run.difficultyLevel,
      rank: recentRank,
    };
    return createAchievementCard(input);
  };
  const downloadAchievement = async () => {
    setCardStatus("creating");
    try {
      const card = await buildAchievementCard();
      downloadAchievementCard(card.blob, card.filename);
      setCardStatus("downloaded");
    } catch {
      setCardStatus("error");
    }
  };
  const shareAchievement = async () => {
    setCardStatus("creating");
    try {
      const card = await buildAchievementCard();
      const file = new File([card.blob], card.filename, { type: "image/png" });
      const run = completedRun ?? snapshot;
      const runner = CHARACTERS.find((character) => character.id === run.characterId) ?? selected;
      const payload = { files: [file], title: "Thẻ thành tích Chạy Đua Cùng Hana", text: `${playerName.trim() || runner.name} vừa chạy cùng ${runner.name} và đạt ${run.score.toLocaleString("vi-VN")} điểm!` };
      if (typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare(payload)) {
        await navigator.share(payload);
        setCardStatus("shared");
      } else {
        downloadAchievementCard(card.blob, card.filename);
        setCardStatus("downloaded");
      }
    } catch {
      setCardStatus("error");
    }
  };

  return (
    <div className="sky-ui" aria-live="polite" onPointerDown={() => { if (snapshot.status === "menu" && snapshot.musicEnabled) window.dispatchEvent(new Event("skydash:menu-interact")); }}>
      {isRunning && (
        <>
          <div className="game-topbar">
            <div className="runner-status">
              <span className="runner-icon" style={{ "--character": selected.body, "--accent": selected.accent } as React.CSSProperties}>{selected.icon}</span>
              <span><b>{selected.name}</b><small>{selected.tagline}</small></span>
            </div>
            <div className="game-score"><small>Điểm</small><strong>{snapshot.score.toLocaleString("vi-VN")}</strong><span>Quãng đường {snapshot.distance}m · Cấp {snapshot.difficultyLevel}</span></div>
            <div className="game-meta"><div className="game-progress"><span>{snapshot.isPractice ? `Luyện tập ${snapshot.practiceStep + 1}/3` : "Vượt vật cản để tăng điểm"}</span><b><Gauge size={14} /> {snapshot.isPractice ? "Đường mây an toàn" : `${snapshot.speed} km/h`}</b>{snapshot.shieldSeconds > 0 && <em><Zap size={13} /> Khiên {snapshot.shieldSeconds}s</em>}</div><div className="game-actions"><button className="sound-button music-control" onClick={() => send({ type: "setMusic", enabled: !snapshot.musicEnabled })} aria-pressed={snapshot.musicEnabled} aria-label={snapshot.musicEnabled ? "Tắt nhạc nền" : "Bật nhạc nền"}>{snapshot.musicEnabled ? <Music2 size={17} /> : <VolumeX size={17} />}</button><button className="sound-button effects-control" onClick={() => send({ type: "setEffects", enabled: !snapshot.effectsEnabled })} aria-pressed={snapshot.effectsEnabled} aria-label={snapshot.effectsEnabled ? "Tắt hiệu ứng âm thanh" : "Bật hiệu ứng âm thanh"}>{snapshot.effectsEnabled ? <Sparkles size={17} /> : <VolumeX size={17} />}</button><button className="pause-button" onClick={() => send({ type: "pause" })} aria-label="Tạm dừng"><Pause size={18} /></button></div></div>
          </div>
          {snapshot.message && <div className="sky-toast">{snapshot.message}</div>}
          <div className="touch-controls" aria-label="Điều khiển cảm ứng">
            <button onClick={() => send({ type: "lane", direction: -1 })} aria-label="Sang làn trái">←</button>
            <button className="jump-control" onClick={() => send({ type: "jump" })} aria-label="Nhảy">↑</button>
            <button onClick={() => send({ type: "lane", direction: 1 })} aria-label="Sang làn phải">→</button>
            <button className="slide-control" onClick={() => send({ type: "slide" })} aria-label="Trượt">↓</button>
          </div>
        </>
      )}

      {snapshot.status === "menu" && (
        <div className="screen-scrim menu-scrim">
          <section className={`menu-panel menu-panel--${menuStep}`}>
            {menuStep === "welcome" ? <>
              <header className="landing-topbar">
                <div className="brand-lockup"><img src={LOGO_URL} alt="Biểu tượng ngôi sao điều ước" /><span>CHẠY ĐUA CÙNG HANA</span></div>
                <div className="landing-utilities"><button className="guide-button" onClick={() => { setTutorialStep(0); setTutorialOpen(true); }}><CircleHelp size={17} /> Hướng dẫn chơi</button><button className="menu-sound-toggle" onClick={() => send({ type: "setMusic", enabled: !snapshot.musicEnabled })} aria-pressed={snapshot.musicEnabled} aria-label={snapshot.musicEnabled ? "Tắt nhạc nền" : "Bật nhạc nền"}>{snapshot.musicEnabled ? <Music2 size={18} /> : <VolumeX size={18} />}<span>Nhạc: {snapshot.musicEnabled ? "Bật" : "Tắt"}</span></button><button className="menu-sound-toggle effects-toggle" onClick={() => send({ type: "setEffects", enabled: !snapshot.effectsEnabled })} aria-pressed={snapshot.effectsEnabled} aria-label={snapshot.effectsEnabled ? "Tắt hiệu ứng âm thanh" : "Bật hiệu ứng âm thanh"}>{snapshot.effectsEnabled ? <Sparkles size={17} /> : <VolumeX size={17} />}<span>Hiệu ứng: {snapshot.effectsEnabled ? "Bật" : "Tắt"}</span></button>{menuAudioHint && <span className="menu-audio-hint" role="status">{menuAudioHint}</span>}</div>
              </header>
              <div className="landing-copy"><p className="eyebrow">ENDLESS RUNNER · CLOUD COLLECTION</p><h1>Bay xa hơn<br />cùng Hana.</h1><p>Một đường chạy mây nhỏ xinh, nơi phản xạ đúng quan trọng hơn tốc độ vội vàng. Nhảy, trượt và đổi làn để tiến vào Top 20 tuần.</p><div className="record-actions"><div className="sky-record-card"><div><span>KỶ LỤC BẦU TRỜI</span><strong>{skyRecord.toLocaleString("vi-VN")}</strong><small>{leaderboardRows.length ? "Điểm dẫn đầu Top 20 tuần" : "Đang chờ chuyến bay đầu tiên"}</small></div><Trophy size={31} /></div><button className="leaderboard-button record-top20" aria-label="Xem Top 20" onClick={openLeaderboard}><Trophy size={16} /> Xem<br />Top 20</button></div><div className="landing-actions"><button className="play-button" onClick={() => { window.dispatchEvent(new Event("skydash:menu-interact")); setNameError(""); setMenuStep("setup"); }}><Play size={20} fill="currentColor" /> Bắt đầu hành trình</button></div></div>
              <div className="landing-art-wrap"><img className="menu-art" src={TARGET_URL} alt="Minh hoạ đường chạy trên mây" /><div className="art-sticker">Vật thấp: nhảy<br />Cổng cao: trượt</div></div>
            </> : <>
              <header className="setup-header"><button className="quiet-button setup-back" onClick={() => setMenuStep("welcome")}><ChevronLeft size={18} /> Quay lại</button><div className="brand-lockup"><img src={LOGO_URL} alt="" /><span>THIẾT LẬP CHUYẾN BAY</span></div><button className="guide-button" onClick={() => { setTutorialStep(0); setTutorialOpen(true); }}><CircleHelp size={17} /> Hướng dẫn</button></header>
              <div className="setup-main"><div className="setup-intro"><p className="eyebrow">BƯỚC 1 / 2 · TÊN NGƯỜI CHƠI</p><h1>Sẵn sàng cất cánh.</h1><p>Nhập tên trước để chuyến bay có thể ghi đúng vào Top 20. Sau đó, bạn có thể giữ Cinnamoroll mặc định hoặc đổi mascot nếu muốn.</p></div><label className="setup-name"><span>BƯỚC 1 · TÊN NGƯỜI CHƠI <b>BẮT BUỘC</b></span><input value={playerName} onChange={(event) => { updatePlayerName(event.target.value.slice(0, 20)); setNameError(""); }} placeholder="Ví dụ: Mây Nhỏ" maxLength={20} /></label><div className="setup-character-step"><span>BƯỚC 2 · MASCOT <b>TÙY CHỌN</b></span><p>Giữ Cinnamoroll mặc định hoặc chạm một nhân vật để đổi.</p></div><div className="setup-selected"><CharacterPortrait character={selected} className="selected-runner-portrait" /><div><span>{hasChosenCharacter ? "MASCOT ĐÃ ĐỔI" : "MASCOT MẶC ĐỊNH"}</span><h2>{selected.name}</h2><p>{selected.tagline}</p><small className="orientation-hint">Preview 360°: mặt trước · gameplay: nhìn lưng khi chạy</small></div><div className="runner-perks"><span>↥ Nhảy {selected.jumpForce.toFixed(1)}</span><span>◒ Trượt {selected.slideDuration.toFixed(2)}s</span><span>◉ Khiên {selected.shieldSeconds.toFixed(1)}s</span></div></div><p className="mobile-setup-tip">BƯỚC 2 (TÙY CHỌN) · Giữ Cinnamoroll hoặc chạm mascot bạn muốn chạy cùng.</p><div className="character-grid">{CHARACTERS.map((character) => (<button key={character.id} onClick={() => { setSelectedId(character.id); setHasChosenCharacter(true); setNameError(""); send({ type: "select", characterId: character.id }); }} className={`character-card ${selectedId === character.id ? "selected" : ""} ${hasChosenCharacter ? "chosen" : ""}`} aria-label={`Chọn ${character.name}; ảnh mặt trước`} aria-pressed={selectedId === character.id}><CharacterPortrait character={character} className="portrait-disc" /><span className="character-card-copy"><b>{character.name}</b><small>Ảnh mặt trước</small></span></button>))}</div>{nameError && <p className="score-error">{nameError}</p>}<div className="setup-actions"><button className="practice-button" disabled={!canLaunch} onClick={() => { window.dispatchEvent(new Event("skydash:prepare")); send({ type: "practice", characterId: selectedId }); }}><Play size={15} fill="currentColor" /> Luyện tập 3 bước</button><button className="play-button" disabled={!canLaunch} onClick={startRun}><Play size={20} fill="currentColor" /> Chạy cùng {selected.name}</button></div>{!canLaunch && <p className="setup-requirements">Cần nhập tên (2–20 ký tự) trước khi chạy.</p>}</div>
            </>}
          </section>
        </div>
      )}

      {snapshot.status === "paused" && (
        <div className="screen-scrim compact-scrim"><section className="pause-panel"><img src={LOGO_URL} alt="" /><p>NHỊP MÂY ĐANG TẠM DỪNG</p><h2>Hít một hơi thật êm.</h2><button className="play-button" onClick={() => send({ type: "resume" })}><Play size={19} fill="currentColor" /> Bay tiếp nào</button><button className="quiet-button" onClick={() => send({ type: "menu" })}>Về bộ sưu tập</button></section></div>
      )}

      {snapshot.status === "gameover" && (
        <div className="screen-scrim compact-scrim"><section className="results-panel auto-save-panel"><div className="result-badge">{snapshot.isNewRecord ? "★ KỶ LỤC MỚI" : "☁ CHUYẾN BAY HOÀN TẤT"}</div><h2>{scoreGreeting.title}</h2><p>{scoreGreeting.body}</p><div className="result-stats"><div><span>Điểm bay</span><strong>{snapshot.score.toLocaleString("vi-VN")}</strong></div><div><span>Cấp đạt</span><strong>{snapshot.difficultyLevel}</strong></div><div><span>Quãng đường</span><strong>{snapshot.distance}m</strong></div></div><div className={`auto-save-status ${saveStatus}`}><Trophy size={18} /><div>{saveStatus === "needsName" && <><b>Đặt tên để ghi hạng nhé.</b><span>Tên giúp chuyến bay này sẵn sàng ghi vào Top 20.</span></>}{saveStatus === "saving" && <><b>Đang đồng bộ hành trình...</b><span>Điểm sẽ tự lưu dưới tên {playerName.trim()}.</span></>}{saveStatus === "ranked" && <><b>{getRankPraise(recentRank)}</b><span>Bảng Top 20 đã xếp lại. Bạn chọn khi nào quay về màn đầu.</span></>}{saveStatus === "outside" && <><b>Chưa vào Top 20 tuần này.</b><span>{getOutsideTop20Message(snapshot.score)}</span></>}{saveStatus === "error" && <><b>Chưa thể đồng bộ điểm.</b><span>{nameError || "Kiểm tra kết nối rồi thử lại ở lượt sau."}</span></>}{saveStatus === "idle" && <><b>Chuẩn bị đồng bộ điểm...</b><span>Đợi một nhịp nhé.</span></>}</div></div>{(saveStatus === "needsName" || saveStatus === "error") && <div className="score-save"><label><span>TÊN HIỂN THỊ TRÊN TOP 20</span><input value={playerName} onChange={(event) => updatePlayerName(event.target.value.slice(0, 20))} placeholder="Ví dụ: Mây Nhỏ" maxLength={20} autoFocus /></label><button className="leaderboard-button" disabled={submitScore.isPending} onClick={() => submitCompletedRun()}>{submitScore.isPending ? "Đang lưu..." : "Lưu & xem hạng"}</button></div>}{nameError && <p className="score-error">{nameError}</p>}{saveStatus !== "saving" && <div className="result-actions"><button className="achievement-button" disabled={cardStatus === "creating"} onClick={() => void downloadAchievement()}><Download size={16} /> {cardStatus === "creating" ? "Đang tạo thẻ..." : cardStatus === "downloaded" ? "Đã tải thẻ PNG" : "Tải thẻ PNG"}</button><button className="share-button" disabled={cardStatus === "creating"} onClick={() => void shareAchievement()}><ImageDown size={16} /> {cardStatus === "shared" ? "Đã mở chia sẻ thẻ" : "Chia sẻ thẻ"}</button><button className="share-button" onClick={() => void shareResult()}><Share2 size={16} /> {shareStatus === "shared" ? "Đã mở chia sẻ" : shareStatus === "copied" ? "Đã sao chép lời khoe" : "Chia sẻ kết quả"}</button>{cardStatus === "error" && <span className="share-note"><Check size={14} /> Chưa tạo được thẻ, hãy thử lại nhé.</span>}{shareStatus === "manual" && <span className="share-note"><Check size={14} /> Hãy sao chép điểm để khoe với bạn bè nhé.</span>}{saveStatus !== "needsName" && saveStatus !== "error" && <button className="leaderboard-button" onClick={openLeaderboard}><Trophy size={16} /> {saveStatus === "ranked" ? "Mở lại Top 20" : "Xem Top 20"}</button>}<button className="play-button" onClick={returnToMenu}>Về màn hình đầu</button></div>}</section></div>
      )}

      {leaderboardOpen && (
        <div className="tutorial-scrim leaderboard-scrim">
          <section className="leaderboard-panel" aria-label="Bảng xếp hạng Top 20">
            <header><div><p><Crown size={15} /> BẦU TRỜI VINH DANH</p><h2>Top 20 tuần</h2><span>Mùa bắt đầu {leaderboard.data?.seasonKey ?? "thứ Bảy này"} · kéo để xem đủ 20 hạng.</span></div><button className="leaderboard-close" onClick={() => setLeaderboardOpen(false)} aria-label="Đóng bảng xếp hạng"><X size={20} /></button></header>
            {leaderboard.isLoading ? <div className="leaderboard-empty">Đang mở bảng xếp hạng...</div> : <ol ref={leaderboardListRef} className="leaderboard-list" aria-label="20 hạng của tuần">{Array.from({ length: 20 }, (_, index) => { const row = leaderboardRows[index]; const rank = index + 1; return row ? <li key={row.id} data-entry-id={row.id} className={`${row.rank <= 3 ? `rank-${row.rank}` : ""} ${row.id === recentEntryId ? "just-ranked" : ""}`}><b>{row.rank}</b><span className="rank-runner">{CHARACTERS.find((character) => character.id === row.runnerId)?.icon ?? "☁"}</span><strong>{row.playerName}</strong><em>{row.distance}m</em><mark>{row.score.toLocaleString("vi-VN")}</mark></li> : <li className="rank-placeholder" key={`empty-rank-${rank}`}><b>{rank}</b><span className="rank-runner">☁</span><strong>Đang chờ chuyến bay</strong><em>Chưa có điểm</em><mark>—</mark></li>; })}</ol>}
            <footer><span>{leaderboard.isFetching ? "Đang xếp lại bảng điểm..." : recentRank ? `Hạng #${recentRank}/20 · ${getRankPraise(recentRank)} Dòng của bạn đang được làm nổi bật.` : "Bảng điểm sẽ chúc mừng khi chuyến bay của bạn vào Top 20."}</span><button className="play-button" onClick={returnToMenu}>Về màn hình đầu</button></footer>
          </section>
        </div>
      )}

      {tutorialOpen && snapshot.status === "menu" && (
        <div className="tutorial-scrim">
          <section className="tutorial-panel guide-pager" aria-label="Hướng dẫn chơi">
            <header className="guide-pager-head"><div><p>HƯỚNG DẪN NHANH · CÓ THỂ BỎ QUA</p><h2>{activeGuidePage.eyebrow}</h2></div><button className="quiet-button guide-skip" onClick={() => setTutorialOpen(false)}>Bỏ qua <X size={16} /></button></header>
            <div className="guide-pager-body grouped-guide"><div className="guide-pager-copy"><span className="guide-rule-pill">{tutorialStep === 0 ? "ĐỔI LÀN ĐỂ NHẶT" : "MỘT VẬT · MỘT HÀNH ĐỘNG"}</span><h3>{activeGuidePage.title}</h3><p>{activeGuidePage.summary}</p></div><div className="guide-item-grid">{activeGuidePage.items.map((item) => <article className="guide-item" key={item.name}><img src={item.image} alt={item.alt} /><div><b>{item.name}</b><span>{item.detail}</span></div></article>)}</div><div className="guide-short-rule">Nhớ nhanh: <b>{activeGuidePage.shortRule}</b></div></div>
            <footer className="guide-pager-footer"><div className="guide-dots" aria-label={`Nhóm ${tutorialStep + 1} trên ${guidePages.length}`}>{guidePages.map((_, index) => <i key={index} className={index === tutorialStep ? "active" : ""} />)}</div><div><button className="quiet-button" disabled={tutorialStep === 0} onClick={() => setTutorialStep((step) => Math.max(0, step - 1))}><ChevronLeft size={17} /> Trước</button><button className="play-button" onClick={() => tutorialStep === guidePages.length - 1 ? setTutorialOpen(false) : setTutorialStep((step) => step + 1)}>{tutorialStep === guidePages.length - 1 ? "Xong, về thiết lập" : "Xem chướng ngại"} <ChevronRight size={18} /></button></div></footer>
          </section>
        </div>
      )}
    </div>
  );
}
