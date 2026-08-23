import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { GameCommand, GameSnapshot, GameStatus, CharacterId, CHARACTERS } from "@/game/types";
import { AudioManager } from "@/game/AudioManager";
import { assetUrl } from "@/lib/assets";
import { nextComboAfterGust, nextComboAfterStar, scoreForClear, scoreForDistance, scoreForGust, scoreForStar } from "@shared/scoring";
import { getNextSpawnDelay, getSpawnZ, getWarningZ, hasSafeLaneSpacing } from "@shared/spawnRules";

type EntityKind = "lowHurdle" | "cloudGate" | "star" | "shield" | "gust";

interface WorldEntity {
  node: TransformNode;
  kind: EntityKind;
  lane: number;
  spin: number;
  prompted?: boolean;
}

const LANES = [-2.6, 0, 2.6];
const PLAYER_Z = 0;
const PROP_TEXTURES = {
  lowHurdle: assetUrl("hana-low-jump-cushion_8c9af18d.png"),
  cloudGate: assetUrl("hana-high-slide-gate_b3d23f2c.png"),
  star: assetUrl("hana-star-reward_f0db88ad.png"),
  shield: assetUrl("sky-dash-rainbow-shield-clean_d2fe8879.png"),
  gust: assetUrl("sky-dash-mint-gust-clean_688581d2.png"),
} as const;
const ENTITY_HITBOX: Record<EntityKind, { x: number; z: number }> = {
  lowHurdle: { x: 0.86, z: 0.92 },
  cloudGate: { x: 0.98, z: 0.96 },
  star: { x: 0.72, z: 0.8 },
  shield: { x: 0.75, z: 0.82 },
  gust: { x: 0.8, z: 0.84 },
};

const getCharacter = (id: CharacterId) => CHARACTERS.find((character) => character.id === id) ?? CHARACTERS[0];

export class GameWorld {
  private readonly scene: Scene;
  private readonly canvas: HTMLCanvasElement;
  private readonly entities: WorldEntity[] = [];
  private readonly decorations: TransformNode[] = [];
  private readonly audio = new AudioManager();
  private readonly rngSeed = 9711;
  private randomState = this.rngSeed;
  private status: GameStatus = "menu";
  private characterId: CharacterId = "cinnamoroll";
  private player: TransformNode | null = null;
  private playerVisual: TransformNode | null = null;
  private playerYVelocity = 0;
  private playerAirHeight = 0;
  private landingTimer = 0;
  private playerLane = 1;
  private targetLane = 1;
  private slideTimer = 0;
  private shieldTimer = 0;
  private score = 0;
  private highScore = 0;
  private stars = 0;
  private distance = 0;
  private multiplier = 1;
  private spawnTimer = 0.7;
  private message = "Chọn một người bạn để bắt đầu đường chạy mây.";
  private messageTimer = 0;
  private stateTimer = 0;
  private elapsed = 0;
  private lastDifficultyLevel = 1;
  private missionAnnounced = false;
  private newRecord = false;
  private isPractice = false;
  private practiceStep = 0;
  private actionHint: "jump" | "slide" | null = null;
  private actionHintTimer = 0;
  private readonly demo = new URLSearchParams(window.location.search).has("demo");
  private readonly demoPractice = new URLSearchParams(window.location.search).has("practice");
  private readonly demoCharacter = (() => {
    const requested = new URLSearchParams(window.location.search).get("character") as CharacterId | null;
    return requested && CHARACTERS.some((character) => character.id === requested) ? requested : undefined;
  })();
  private readonly demoLesson = new URLSearchParams(window.location.search).get("lesson");
  private readonly demoAction = (() => {
    const action = new URLSearchParams(window.location.search).get("qaAction");
    return action === "jump" || action === "slide" ? action : null;
  })();
  private readonly demoPickup = (() => {
    const pickup = new URLSearchParams(window.location.search).get("pickup");
    return pickup === "star" || pickup === "shield" || pickup === "gust" ? pickup : null;
  })();
  private readonly demoInspect = new URLSearchParams(window.location.search).has("inspect");
  private readonly demoHit = new URLSearchParams(window.location.search).has("hit");
  private readonly demoResult = new URLSearchParams(window.location.search).has("result");
  private readonly demoDense = new URLSearchParams(window.location.search).has("qaDense");
  private readonly demoDistance = (() => {
    const value = Number(new URLSearchParams(window.location.search).get("qaDistance"));
    return Number.isFinite(value) ? Math.max(0, Math.min(650, Math.floor(value))) : 0;
  })();
  private pointerStart: { x: number; y: number } | null = null;

  private readonly onCommand = (event: Event) => this.handleCommand((event as CustomEvent<GameCommand>).detail);
  private readonly onKeyDown = (event: KeyboardEvent) => this.handleKey(event);
  private readonly onPointerDown = (event: PointerEvent) => {
    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.canvas.setPointerCapture?.(event.pointerId);
  };
  private readonly onPointerUp = (event: PointerEvent) => this.handleSwipe(event);
  private readonly onPointerCancel = () => { this.pointerStart = null; };

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.scene = scene;
    this.canvas = canvas;
    this.highScore = Number(window.localStorage.getItem("skyDashHighScore") ?? 0);
    this.buildTrack();
    this.buildSkyDecorations();
    this.buildPlayer();
    window.addEventListener("skydash:command", this.onCommand as EventListener);
    window.addEventListener("keydown", this.onKeyDown);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerCancel);
    this.emitState();
    if (this.demoResult) {
      window.setTimeout(() => {
        this.score = 1_760;
        this.distance = 214;
        this.lastDifficultyLevel = this.getDifficulty().level;
        this.endRun();
      }, 250);
    } else if (this.demo || this.demoPractice) window.setTimeout(() => this.start(this.demoCharacter, this.demoPractice), 250);
  }

  update(delta: number) {
    this.elapsed += delta;
    this.updateDecorations(delta);
    if (this.status !== "playing") return;

    const difficulty = this.getDifficulty();
    const speed = this.demoDense || (this.demoLesson && !this.demoAction) || (this.demoPickup && this.demoInspect) ? 0 : this.isPractice ? 7.6 : this.demoPickup || this.demoAction ? 1.1 : difficulty.speed;
    if (difficulty.level > this.lastDifficultyLevel) {
      this.lastDifficultyLevel = difficulty.level;
      this.audio.play("shield");
      this.showMessage(`Tăng nhịp — Cấp ${difficulty.level}!`);
    }
    const metersTravelled = speed * delta * 0.43;
    this.distance += metersTravelled;
    this.score += scoreForDistance(metersTravelled, this.multiplier);
    this.spawnTimer -= delta;
    this.slideTimer = Math.max(0, this.slideTimer - delta);
    this.shieldTimer = Math.max(0, this.shieldTimer - delta);
    this.messageTimer = Math.max(0, this.messageTimer - delta);
    this.actionHintTimer = Math.max(0, this.actionHintTimer - delta);
    if (this.actionHintTimer === 0) this.actionHint = null;

    this.updatePlayer(delta);
    if (this.demo && !this.demoLesson) this.runDemoBrain();
    this.updateEntities(delta, speed);
    if (!this.demoLesson && !this.isPractice && this.spawnTimer <= 0) {
      this.spawnBeat(difficulty.level);
      this.spawnTimer = getNextSpawnDelay(difficulty.level, this.distance, this.random() * 0.28);
    }
    this.stateTimer -= delta;
    if (this.stateTimer <= 0) {
      this.emitState();
      this.stateTimer = 0.08;
    }
  }

  dispose() {
    window.removeEventListener("skydash:command", this.onCommand as EventListener);
    window.removeEventListener("keydown", this.onKeyDown);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerCancel);
    this.entities.forEach((entity) => entity.node.dispose(false, true));
    this.decorations.forEach((node) => node.dispose(false, true));
    this.player?.dispose(false, true);
    this.audio.dispose();
  }

  private handleCommand(command: GameCommand) {
    if (!command) return;
    if (command.type === "toggleAudio") {
      void this.audio.toggle(this.status === "playing").then((started) => {
        this.showMessage(!this.audio.isEnabled ? "Âm thanh đã tắt." : started ? "Nhạc nền đã bật — mây đang ngân nga!" : "Không phát được nhạc. Chạm loa để thử lại.");
        this.emitState();
      });
      this.emitState();
      return;
    }
    if (command.type === "start") this.start(command.characterId);
    if (command.type === "practice") this.start(command.characterId, true);
    if (command.type === "select") { this.audio.play("button"); this.selectCharacter(command.characterId); }
    if (command.type === "lane" && this.status === "playing") this.changeLane(command.direction);
    if (command.type === "jump" && this.status === "playing") this.jump();
    if (command.type === "slide" && this.status === "playing") this.slide();
    if (command.type === "pause" && this.status === "playing") { this.audio.play("button"); this.audio.pauseMusic(); this.setStatus("paused", "Trên mây cũng cần nghỉ một nhịp."); }
    if (command.type === "resume" && this.status === "paused") { this.audio.play("button"); void this.startMusicWithFeedback(); this.setStatus("playing", "Bay tiếp nào!"); }
    if (command.type === "restart") this.start();
    if (command.type === "menu") { this.audio.play("button"); this.audio.stopMusic(); this.setStatus("menu", "Chọn một người bạn để bắt đầu đường chạy mây."); }
  }

  private handleKey(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s", " ", "escape"].includes(key)) event.preventDefault();
    if (event.repeat) return;
    if (key === "arrowleft" || key === "a") this.handleCommand({ type: "lane", direction: -1 });
    if (key === "arrowright" || key === "d") this.handleCommand({ type: "lane", direction: 1 });
    if (key === "arrowup" || key === "w" || key === " ") this.handleCommand({ type: "jump" });
    if (key === "arrowdown" || key === "s") this.handleCommand({ type: "slide" });
    if (key === "escape") this.handleCommand({ type: this.status === "playing" ? "pause" : "resume" });
  }

  private handleSwipe(event: PointerEvent) {
    if (!this.pointerStart || this.status !== "playing") return;
    const dx = event.clientX - this.pointerStart.x;
    const dy = event.clientY - this.pointerStart.y;
    this.pointerStart = null;
    if (this.canvas.hasPointerCapture?.(event.pointerId)) this.canvas.releasePointerCapture?.(event.pointerId);
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 26) this.changeLane(dx > 0 ? 1 : -1);
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 26) dy < 0 ? this.jump() : this.slide();
  }

  private setStatus(status: GameStatus, message?: string) {
    this.status = status;
    if (message) this.showMessage(message);
    this.emitState();
  }

  private start(characterId?: CharacterId, practice = false) {
    this.audio.play("button");
    void this.startMusicWithFeedback();
    if (characterId) this.selectCharacter(characterId);
    this.entities.splice(0).forEach((entity) => entity.node.dispose(false, true));
    this.randomState = this.rngSeed;
    this.score = 0;
    this.stars = 0;
    this.distance = this.demoDistance;
    this.multiplier = 1;
    this.playerLane = 1;
    this.targetLane = 1;
    this.playerYVelocity = 0;
    this.playerAirHeight = 0;
    this.landingTimer = 0;
    this.slideTimer = 0;
    this.shieldTimer = 0;
    this.spawnTimer = 0.55;
    this.missionAnnounced = false;
    this.newRecord = false;
    this.lastDifficultyLevel = this.getDifficulty().level;
    this.isPractice = practice;
    this.practiceStep = 0;
    this.actionHint = null;
    this.actionHintTimer = 0;
    const inspectionLane = this.demoInspect ? 0 : 1;
    const inspectionZ = this.demoInspect ? 4.2 : 6;
    if (this.demoLesson === "jump") this.spawnEntity("lowHurdle", inspectionLane, inspectionZ);
    if (this.demoLesson === "slide") this.spawnEntity("cloudGate", inspectionLane, inspectionZ);
    if (this.demoLesson === "star") this.spawnEntity("star", inspectionLane, inspectionZ);
    if (this.demoAction === "jump") {
      this.entities.splice(0).forEach((entity) => entity.node.dispose(false, true));
      this.spawnEntity("lowHurdle", 1, this.demoHit ? 3 : 6);
      this.spawnTimer = 99;
    }
    if (this.demoAction === "slide") {
      this.entities.splice(0).forEach((entity) => entity.node.dispose(false, true));
      this.spawnEntity("cloudGate", 1, this.demoHit ? 3 : 6);
      this.spawnTimer = 99;
    }
    if (this.demoPickup) {
      this.spawnEntity(this.demoPickup, this.demoInspect ? 0 : 1, this.demoHit ? 0.3 : this.demoInspect ? 4.2 : 9);
      this.spawnTimer = 99;
    }
    if (this.demoDense) {
      this.spawnEntity("lowHurdle", 0, 12);
      this.spawnEntity("cloudGate", 2, 15);
      this.spawnEntity("star", 1, 18);
      this.spawnTimer = 99;
      this.showMessage("Nhịp mây dày hơn — làn giữa vẫn an toàn.");
    }
    if (this.player) this.player.position = new Vector3(0, 0, PLAYER_Z);
    if (practice) {
      this.spawnPracticeStep();
      this.setStatus("playing", "Luyện tập 1/3: đổi làn để lấy sao.");
      return;
    }
    this.setStatus("playing", "Lướt qua mây, gom điều ước!");
  }

  private async startMusicWithFeedback() {
    const started = await this.audio.startMusic();
    if (!started && this.status === "playing") {
      this.showMessage("Nhạc chưa phát. Chạm biểu tượng loa để thử lại.");
      this.emitState();
    }
  }

  private selectCharacter(characterId: CharacterId) {
    this.characterId = characterId;
    this.buildPlayer();
    if (this.status === "menu") this.showMessage(`${getCharacter(characterId).name} đã sẵn sàng bay.`);
    this.emitState();
  }

  private changeLane(direction: -1 | 1) {
    this.targetLane = Math.max(0, Math.min(2, this.targetLane + direction));
  }

  private jump() {
    if (!this.player || this.playerAirHeight > 0.03 || this.slideTimer > 0) return;
    this.audio.play("jump");
    this.playerYVelocity = getCharacter(this.characterId).jumpForce;
    this.showMessage("Nhảy thật cao!");
  }

  private slide() {
    if (!this.player || this.playerAirHeight > 0.08) return;
    this.audio.play("slide");
    this.slideTimer = getCharacter(this.characterId).slideDuration;
    this.showMessage("Lướt qua nào!");
  }

  private updatePlayer(delta: number) {
    if (!this.player) return;
    const targetX = LANES[this.targetLane];
    const laneDelta = targetX - this.player.position.x;
    this.player.position.x += laneDelta * Math.min(1, delta * 12);
    this.playerYVelocity -= 26 * delta;
    const wasAirborne = this.playerAirHeight > 0.01;
    this.playerAirHeight = Math.max(0, this.playerAirHeight + this.playerYVelocity * delta);
    if (this.playerAirHeight <= 0) {
      if (wasAirborne && this.playerYVelocity < 0) this.landingTimer = 0.2;
      this.playerYVelocity = 0;
    }
    this.landingTimer = Math.max(0, this.landingTimer - delta);

    const runPhase = this.elapsed * 16;
    const runWave = Math.sin(runPhase);
    const isSliding = this.slideTimer > 0;
    const isAirborne = this.playerAirHeight > 0.01;
    const landingPulse = this.landingTimer > 0 ? this.landingTimer / 0.2 : 0;
    const runningBob = isAirborne || isSliding ? 0 : runWave * 0.065;
    this.player.position.y = this.playerAirHeight + runningBob;
    this.player.rotation.z = 0;
    this.player.scaling.set(1, 1, 1);
    if (this.playerVisual) {
      const visual = this.playerVisual;
      visual.position.y = isSliding ? 0.16 : 0.2 + (isAirborne ? Math.sin(this.elapsed * 10) * 0.025 : runWave * 0.028);
      visual.rotation.z = isSliding ? -0.06 : isAirborne ? laneDelta * -0.018 : laneDelta * -0.026 + runWave * 0.012;
      visual.scaling.x = isSliding ? 1.12 : isAirborne ? (this.playerYVelocity > 0 ? 0.93 : 1.05) : 1 + landingPulse * 0.11;
      visual.scaling.y = isSliding ? 0.65 : isAirborne ? (this.playerYVelocity > 0 ? 1.08 : 0.97) : 1 - landingPulse * 0.13 + runWave * 0.012;
      visual.scaling.z = 1;
      const body = visual.getChildMeshes().find((mesh) => mesh.name === "avatarBody");
      if (body) body.position.y = isSliding ? 0.53 : 0.72;
      const ears = visual.getChildMeshes().filter((mesh) => mesh.name.startsWith("avatarEar") || mesh.name.startsWith("kittyEar"));
      ears.forEach((ear, index) => { ear.rotation.z = (index % 2 === 0 ? -1 : 1) * (0.08 + runWave * 0.1 + (isAirborne ? 0.15 : 0)); });
      const badge = visual.getChildMeshes().find((mesh) => mesh.name === "runnerBadge");
      if (badge) {
        badge.position.y = isSliding ? 0.66 : 0.96;
        badge.rotation.z = isSliding ? -0.18 : runWave * 0.25;
      }
    }
    const shieldRing = this.player.getChildMeshes().find((mesh) => mesh.name === "shieldRing");
    if (shieldRing) shieldRing.isVisible = this.shieldTimer > 0;
  }

  private updateEntities(delta: number, speed: number) {
    for (let index = this.entities.length - 1; index >= 0; index -= 1) {
      const entity = this.entities[index];
      entity.node.position.z -= speed * delta;
      entity.node.rotation.z += entity.spin * delta;
      entity.node.position.y += Math.sin(this.elapsed * 5 + index) * delta * 0.1;
      if (entity.node.position.z < -9) {
        const missedPracticeStar = this.isPractice && this.practiceStep === 0 && entity.kind === "star";
        entity.node.dispose(false, true);
        this.entities.splice(index, 1);
        if (missedPracticeStar) {
          this.showMessage("Hãy đổi làn để lấy sao — thử lại nhé!");
          this.spawnPracticeStep();
        }
        continue;
      }
      const warningDistance = getWarningZ(speed);
      if (!entity.prompted && (entity.kind === "lowHurdle" || entity.kind === "cloudGate") && entity.node.position.z < warningDistance && entity.node.position.z > warningDistance - 2) {
        entity.prompted = true;
        this.actionHint = entity.kind === "lowHurdle" ? "jump" : "slide";
        this.actionHintTimer = this.demoLesson ? 99 : 2;
        this.showMessage(entity.kind === "lowHurdle" ? "Đệm thấp phía trước." : "Cổng mây cao phía trước.");
      }
      if (!entity.prompted && (entity.kind === "star" || entity.kind === "shield" || entity.kind === "gust") && entity.node.position.z < warningDistance && entity.node.position.z > warningDistance - 2) {
        entity.prompted = true;
        this.showMessage(entity.kind === "star" ? "Sao xu: đổi làn để +4 điểm!" : entity.kind === "shield" ? "Khiên cầu vồng: chạm để chặn 1 va chạm!" : "Vòng gió mint: chạm để +40 điểm!");
      }
      const hitbox = ENTITY_HITBOX[entity.kind];
      const horizontalHit = Math.abs(entity.node.position.x - (this.player?.position.x ?? 0)) < hitbox.x;
      const depthHit = Math.abs(entity.node.position.z - PLAYER_Z) < hitbox.z;
      if (horizontalHit && depthHit) {
        if (entity.kind === "star") {
          this.audio.play("pickup");
          this.stars += 1;
          const starPoints = scoreForStar(this.multiplier, getCharacter(this.characterId).starBonus);
          this.score += starPoints;
          this.multiplier = nextComboAfterStar(this.multiplier);
          this.showMessage(`Sao xu: +${Math.round(starPoints)} điểm!`);
          this.removeEntity(index);
          continue;
        }
        if (entity.kind === "shield") {
          this.audio.play("shield");
          this.shieldTimer = getCharacter(this.characterId).shieldSeconds;
          this.showMessage(`Khiên cầu vồng: ${this.shieldTimer.toFixed(1)} giây!`);
          this.removeEntity(index);
          if (this.isPractice && this.practiceStep === 0) this.advancePractice();
          continue;
        }
        if (entity.kind === "gust") {
          this.audio.play("pickup");
          const gustPoints = scoreForGust(this.multiplier);
          this.score += gustPoints;
          this.multiplier = nextComboAfterGust(this.multiplier);
          this.showMessage(`Gió mint: +${Math.round(gustPoints)} điểm!`);
          this.removeEntity(index);
          continue;
        }
        const clearedLowHurdle = entity.kind === "lowHurdle" && this.playerAirHeight > 0.76;
        const clearedCloudGate = entity.kind === "cloudGate" && this.slideTimer > 0.08;
        if (clearedLowHurdle || clearedCloudGate) {
          this.audio.play("clear");
          this.score += scoreForClear(this.multiplier);
          this.removeEntity(index);
          if (this.isPractice) this.advancePractice();
          continue;
        }
        if (this.shieldTimer > 0) {
          this.audio.play("shield");
          this.shieldTimer = 0;
          this.showMessage("Khiên đã che chắn bạn!");
          this.removeEntity(index);
          continue;
        }
        if (this.isPractice) {
          entity.node.position.z = 15;
          this.showMessage(entity.kind === "lowHurdle" ? "Đệm thấp cần NHẢY qua — thử lại nhé!" : "Cổng mây cao cần TRƯỢT dưới — thử lại nhé!");
          continue;
        }
        this.endRun();
        return;
      }
    }
  }

  private removeEntity(index: number) {
    const [entity] = this.entities.splice(index, 1);
    entity.node.dispose(false, true);
  }

  private spawnPracticeStep() {
    this.entities.splice(0).forEach((entity) => entity.node.dispose(false, true));
    this.playerLane = 1;
    this.targetLane = 1;
    if (this.player) this.player.position.x = LANES[1];
    if (this.practiceStep === 0) this.spawnEntity("shield", 2, 17);
    if (this.practiceStep === 1) this.spawnEntity("lowHurdle", 1, 17);
    if (this.practiceStep === 2) this.spawnEntity("cloudGate", 1, 17);
  }

  private advancePractice() {
    this.practiceStep += 1;
    if (this.practiceStep >= 3) {
      this.isPractice = false;
      this.entities.splice(0).forEach((entity) => entity.node.dispose(false, true));
      this.setStatus("menu", "Hoàn tất luyện tập! Chọn một người bạn và bắt đầu lượt chạy.");
      return;
    }
    this.spawnPracticeStep();
    const guidance = ["Luyện tập 1/3: đổi làn để lấy khiên.", "Luyện tập 2/3: nhảy qua đệm thấp.", "Luyện tập 3/3: trượt dưới cổng mây."];
    this.showMessage(guidance[this.practiceStep]);
  }

  private endRun() {
    this.audio.pauseMusic();
    this.audio.play("gameover");
    const finalScore = Math.floor(this.score);
    this.newRecord = finalScore > this.highScore;
    if (this.newRecord) {
      this.highScore = finalScore;
      window.localStorage.setItem("skyDashHighScore", String(this.highScore));
    }
    this.setStatus("gameover", this.newRecord ? "Kỷ lục mới! Bầu trời vỗ tay cho bạn." : "Chuyến bay kết thúc, thử thêm một lần nữa nhé.");
  }

  private getDifficulty() {
    const level = Math.min(6, 1 + Math.floor(this.distance / 110));
    const speed = Math.min(21, 8.4 + (level - 1) * 1.7 + this.distance / 430);
    return { level, speed };
  }

  private spawnBeat(level: number) {
    const roll = this.random();
    const spawnZ = getSpawnZ(level);
    const currentHazards = this.entities
      .filter((entity) => entity.kind === "lowHurdle" || entity.kind === "cloudGate")
      .map((entity) => ({ lane: entity.lane, z: entity.node.position.z }));
    const openHazardLanes = [0, 1, 2].filter((lane) => hasSafeLaneSpacing(currentHazards, [lane], spawnZ));
    const lane = Math.floor(this.random() * 3);

    if (roll < 0.62 && openHazardLanes.length > 0) {
      const safeLane = Math.floor(this.random() * 3);
      const occupiedLanes = [0, 1, 2].filter((candidate) => candidate !== safeLane);
      const actionKind: EntityKind = this.random() < 0.56 ? "lowHurdle" : "cloudGate";
      const canCreateDouble = level >= 3
        && this.random() < 0.14 + level * 0.055
        && hasSafeLaneSpacing(currentHazards, occupiedLanes, spawnZ);
      const hazardLanes = canCreateDouble ? occupiedLanes : [openHazardLanes[Math.floor(this.random() * openHazardLanes.length)]];
      hazardLanes.forEach((hazardLane) => this.spawnEntity(actionKind, hazardLane, spawnZ));
      return;
    }
    if (roll < 0.82 && openHazardLanes.length > 0) {
      const actionKind: EntityKind = this.random() < 0.5 ? "lowHurdle" : "cloudGate";
      this.spawnEntity(actionKind, openHazardLanes[Math.floor(this.random() * openHazardLanes.length)], spawnZ);
      return;
    }
    if (roll < 0.95) {
      this.spawnEntity("star", lane, spawnZ + 3);
      if (level >= 2 && this.random() < 0.44) this.spawnEntity("star", (lane + 1) % 3, spawnZ + 9);
      return;
    }
    this.spawnEntity(roll < 0.985 ? "shield" : "gust", lane, spawnZ + 3);
  }

  private spawnEntity(kind: EntityKind, lane: number, z: number) {
    const node = new TransformNode(`${kind}-${this.elapsed.toFixed(2)}`, this.scene);
    node.position = new Vector3(LANES[lane], 0, z);
    if (kind === "lowHurdle") this.createLowHurdle(node);
    if (kind === "cloudGate") this.createCloudGate(node);
    if (kind === "star") this.createStar(node);
    if (kind === "shield") this.createShield(node);
    if (kind === "gust") this.createGust(node);
    this.entities.push({ node, kind, lane, spin: kind === "star" ? 1.8 : kind === "gust" ? 0.42 : 0 });
  }

  private buildTrack() {
    const trackMaterial = this.material("cloudRibbon", "#C85A7B", 0.06);
    const laneMaterial = this.material("laneSeam", "#1F5F93", 0.14);
    const edgeMaterial = this.material("trackEdge", "#F7B632", 0.16);
    const track = MeshBuilder.CreateGround("cloudRibbonTrack", { width: 9.15, height: 112, subdivisions: 2 }, this.scene);
    track.position.z = 44;
    track.material = trackMaterial;
    for (const x of [-1.3, 1.3]) {
      const seam = MeshBuilder.CreateBox(`laneSeam${x}`, { width: 0.19, height: 0.13, depth: 112 }, this.scene);
      seam.position = new Vector3(x, 0.065, 44);
      seam.material = laneMaterial;
    }
    for (const x of [-4.62, 4.62]) {
      const rail = MeshBuilder.CreateBox(`puffyRail${x}`, { width: 0.28, height: 0.27, depth: 112 }, this.scene);
      rail.position = new Vector3(x, 0.18, 44);
      rail.material = edgeMaterial;
    }
  }

  private buildSkyDecorations() {
    const cloudMaterial = this.material("cloudPuffs", "#FFFDF4", 0.02);
    const peachCloudMaterial = this.material("peachCloudPuffs", "#FFDAC7", 0.03);
    for (let index = 0; index < 13; index += 1) {
      const cloud = new TransformNode(`cloud-${index}`, this.scene);
      const x = index % 2 === 0 ? -7.2 - this.random() * 4 : 7.2 + this.random() * 4;
      cloud.position = new Vector3(x, 1.2 + this.random() * 4.5, 5 + index * 8);
      this.createCloud(cloud, index % 3 === 0 ? peachCloudMaterial : cloudMaterial, 0.8 + this.random() * 1.1);
      this.decorations.push(cloud);
    }
    const rainbow = new TransformNode("horizonRainbow", this.scene);
    rainbow.position = new Vector3(0, 4.9, 53);
    const rainbowMat = this.material("rainbowWarm", "#FFD66B", 0.2);
    const arc = MeshBuilder.CreateTorus("rainbowArc", { diameter: 9.3, thickness: 0.19, tessellation: 32 }, this.scene);
    arc.parent = rainbow;
    arc.scaling.y = 0.55;
    arc.material = rainbowMat;
    this.decorations.push(rainbow);
  }

  private updateDecorations(delta: number) {
    this.decorations.forEach((node, index) => {
      node.position.x += Math.sin(this.elapsed * 0.12 + index) * delta * 0.035;
      node.rotation.z = Math.sin(this.elapsed * 0.34 + index) * 0.025;
    });
  }

  private buildPlayer() {
    this.player?.dispose(false, true);
    const character = getCharacter(this.characterId);
    const body = this.material(`body-${character.id}`, character.body, 0.06);
    const accent = this.material(`accent-${character.id}`, character.accent, 0.18);
    const softAccent = this.material(`soft-${character.id}`, character.accentSoft, 0.08);
    const ink = this.material(`ink-${character.id}`, "#233C62", 0.04);
    const root = new TransformNode("runner", this.scene);
    root.position = new Vector3(LANES[this.playerLane], 0, PLAYER_Z);
    const visual = new TransformNode("playerVisual", this.scene);
    visual.parent = root;
    visual.position = new Vector3(0, 0.2, -0.12);

    const bodyMesh = MeshBuilder.CreateSphere("avatarBody", { diameter: 1.18, segments: 20 }, this.scene);
    bodyMesh.parent = visual;
    bodyMesh.position.y = 0.72;
    bodyMesh.scaling = new Vector3(0.82, 1.05, 0.72);
    bodyMesh.material = body;
    const head = MeshBuilder.CreateSphere("avatarHead", { diameter: 1.32, segments: 20 }, this.scene);
    head.parent = visual;
    head.position.y = 1.55;
    head.scaling = new Vector3(1, 0.94, 0.82);
    head.material = body;
    for (const x of [-0.24, 0.24]) {
      const eye = MeshBuilder.CreateSphere(`avatarEye${x}`, { diameter: 0.12, segments: 12 }, this.scene);
      eye.parent = visual;
      eye.position = new Vector3(x, 1.61, -0.55);
      eye.material = ink;
      const cheek = MeshBuilder.CreateSphere(`avatarCheek${x}`, { diameter: 0.17, segments: 12 }, this.scene);
      cheek.parent = visual;
      cheek.position = new Vector3(x * 1.75, 1.43, -0.54);
      cheek.scaling.x = 1.3;
      cheek.material = softAccent;
    }

    if (character.silhouette === "cloud" || character.silhouette === "bunny") {
      for (const x of [-0.37, 0.37]) {
        const ear = MeshBuilder.CreateSphere(`avatarEar${x}`, { diameter: 0.48, segments: 18 }, this.scene);
        ear.parent = visual;
        ear.position = new Vector3(x, 2.18, 0);
        ear.scaling = new Vector3(0.72, 1.7, 0.58);
        ear.rotation.z = x * -0.4;
        ear.material = character.silhouette === "bunny" ? accent : body;
      }
    }
    if (character.silhouette === "pudding") {
      const beret = MeshBuilder.CreateSphere("puddingBeret", { diameter: 0.75, segments: 16 }, this.scene);
      beret.parent = visual;
      beret.position = new Vector3(0.13, 2.08, -0.03);
      beret.scaling.y = 0.32;
      beret.material = accent;
    }
    if (character.silhouette === "imp") {
      for (const x of [-0.4, 0, 0.4]) {
        const spike = MeshBuilder.CreatePolyhedron(`impSpike${x}`, { type: 1, size: 0.4 }, this.scene);
        spike.parent = visual;
        spike.position = new Vector3(x, 2.2 - Math.abs(x) * 0.35, 0);
        spike.scaling.y = 1.25;
        spike.material = accent;
      }
    }
    if (character.silhouette === "penguin") {
      const belly = MeshBuilder.CreateSphere("penguinBelly", { diameter: 0.9, segments: 18 }, this.scene);
      belly.parent = visual;
      belly.position = new Vector3(0, 0.78, -0.51);
      belly.scaling = new Vector3(0.72, 0.92, 0.2);
      belly.material = softAccent;
      const beak = MeshBuilder.CreatePolyhedron("penguinBeak", { type: 1, size: 0.24 }, this.scene);
      beak.parent = visual;
      beak.position = new Vector3(0, 1.45, -0.7);
      beak.material = accent;
    }
    if (character.silhouette === "frog") {
      for (const x of [-0.34, 0.34]) {
        const eyeBulge = MeshBuilder.CreateSphere(`frogEye${x}`, { diameter: 0.38, segments: 16 }, this.scene);
        eyeBulge.parent = visual;
        eyeBulge.position = new Vector3(x, 1.98, -0.25);
        eyeBulge.material = body;
      }
    }
    if (character.silhouette === "egg") {
      bodyMesh.scaling = new Vector3(0.75, 1.28, 0.72);
      head.isVisible = false;
      for (const mesh of visual.getChildMeshes()) {
        if (mesh.name.startsWith("avatarEye") || mesh.name.startsWith("avatarCheek")) mesh.position.y -= 0.38;
      }
    }
    if (character.silhouette === "kitty") {
      for (const x of [-0.44, 0.44]) {
        const ear = MeshBuilder.CreatePolyhedron(`kittyEar${x}`, { type: 1, size: 0.38 }, this.scene);
        ear.parent = visual;
        ear.position = new Vector3(x, 2.14, 0);
        ear.scaling.y = 1.25;
        ear.material = body;
      }
      const bow = MeshBuilder.CreateSphere("kittyBow", { diameter: 0.42, segments: 14 }, this.scene);
      bow.parent = visual;
      bow.position = new Vector3(0.56, 1.92, -0.42);
      bow.scaling.x = 1.45;
      bow.material = accent;
    }

    const runnerBadge = MeshBuilder.CreateTorus("runnerBadge", { diameter: 0.38, thickness: 0.07, tessellation: 18 }, this.scene);
    runnerBadge.parent = visual;
    runnerBadge.position = new Vector3(0, 0.96, -0.58);
    runnerBadge.rotation.x = Math.PI / 2;
    runnerBadge.material = accent;
    const shieldRing = MeshBuilder.CreateTorus("shieldRing", { diameter: 2.25, thickness: 0.075, tessellation: 32 }, this.scene);
    shieldRing.parent = root;
    shieldRing.position.y = 1.1;
    shieldRing.rotation.x = Math.PI / 2;
    shieldRing.material = softAccent;
    shieldRing.isVisible = false;
    this.player = root;
    this.playerVisual = visual;
  }

  private createCloud(root: TransformNode, material: StandardMaterial, scale: number) {
    const positions = [[0, 0, 0], [-0.72, -0.02, 0.08], [0.68, -0.04, 0.1], [-0.25, 0.42, 0], [0.28, 0.38, 0]];
    positions.forEach(([x, y, z], index) => {
      const puff = MeshBuilder.CreateSphere(`puff-${index}`, { diameter: 1.1 }, this.scene);
      puff.parent = root;
      puff.position = new Vector3(x * scale, y * scale, z * scale);
      puff.scaling = new Vector3(scale, scale * 0.74, scale * 0.72);
      puff.material = material;
    });
  }

  private createLowHurdle(root: TransformNode) {
    this.createStickerProp(root, "lowJumpCushion", PROP_TEXTURES.lowHurdle, 1.72, 1.34, 0.72);
  }

  private createCloudGate(root: TransformNode) {
    this.createStickerProp(root, "highSlideGate", PROP_TEXTURES.cloudGate, 2.78, 3.04, 2.12);
  }

  private createStar(root: TransformNode) {
    this.createStickerProp(root, "wishStar", PROP_TEXTURES.star, 1.22, 1.22, 0.68);
  }

  private createShield(root: TransformNode) {
    this.createStickerProp(root, "rainbowShieldPickup", PROP_TEXTURES.shield, 1.52, 1.52, 0.9);
  }

  private createGust(root: TransformNode) {
    this.createStickerProp(root, "mintGustPickup", PROP_TEXTURES.gust, 1.56, 1.56, 0.9);
  }

  private createActionBadge(root: TransformNode, action: "jump" | "slide", y: number) {
    const navy = this.material(`actionNavy-${action}-${this.elapsed}`, "#213E63", 0.22);
    const skyPudding = this.material(`actionPudding-${action}-${this.elapsed}`, "#FFE069", 0.48);
    const disc = MeshBuilder.CreateSphere(`actionBadge-${action}`, { diameter: 0.42, segments: 16 }, this.scene);
    disc.parent = root;
    disc.position = new Vector3(0.7, y, -0.18);
    disc.material = navy;
    const arrow = MeshBuilder.CreatePolyhedron(`actionArrow-${action}`, { type: 1, size: 0.18 }, this.scene);
    arrow.parent = root;
    arrow.position = new Vector3(0.7, y, -0.41);
    arrow.rotation.z = action === "jump" ? Math.PI : 0;
    arrow.material = skyPudding;
  }

  private createStickerProp(root: TransformNode, name: string, url: string, width: number, height: number, y: number) {
    const texture = new Texture(url, this.scene, true, true);
    texture.hasAlpha = true;
    const material = new StandardMaterial(`${name}Material-${this.elapsed}`, this.scene);
    material.diffuseTexture = texture;
    material.opacityTexture = texture;
    material.emissiveTexture = texture;
    material.useAlphaFromDiffuseTexture = true;
    material.disableLighting = true;
    material.backFaceCulling = false;
    const plane = MeshBuilder.CreatePlane(name, { width, height, sideOrientation: Mesh.DOUBLESIDE }, this.scene);
    plane.parent = root;
    plane.position = new Vector3(0, y, -0.3);
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    plane.material = material;
  }

  private material(name: string, hex: string, emissive: number) {
    const material = new StandardMaterial(name, this.scene);
    material.diffuseColor = Color3.FromHexString(hex);
    material.emissiveColor = Color3.FromHexString(hex).scale(emissive);
    material.specularColor = new Color3(0.06, 0.06, 0.08);
    return material;
  }

  private showMessage(message: string) {
    this.message = message;
    this.messageTimer = 1.8;
  }

  private emitState() {
    const snapshot: GameSnapshot = {
      status: this.status,
      characterId: this.characterId,
      score: Math.floor(this.score),
      highScore: this.highScore,
      stars: this.stars,
      distance: Math.floor(this.distance),
      multiplier: Math.max(1, Number(this.multiplier.toFixed(1))),
      shieldSeconds: Number(this.shieldTimer.toFixed(1)),
      missionProgress: 0,
      message: this.messageTimer > 0 || this.status !== "playing" ? this.message : "",
      isNewRecord: this.newRecord,
      audioEnabled: this.audio.isEnabled,
      difficultyLevel: this.getDifficulty().level,
      speed: Math.round(this.getDifficulty().speed),
      actionHint: this.actionHintTimer > 0 ? this.actionHint : null,
      isPractice: this.isPractice,
      practiceStep: this.practiceStep,
    };
    window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: snapshot }));
  }

  private random() {
    this.randomState = (this.randomState * 9301 + 49297) % 233280;
    return this.randomState / 233280;
  }

  private runDemoBrain() {
    const reactionDistance = this.demoAction ? 1.8 : 7;
    const imminent = this.entities.find((entity) => (entity.kind === "lowHurdle" || entity.kind === "cloudGate") && entity.node.position.z < reactionDistance && entity.node.position.z > -0.4 && Math.abs(entity.node.position.x - (this.player?.position.x ?? 0)) < 1.1);
    if (imminent) {
      if (imminent.kind === "lowHurdle") {
        if (this.demoAction) {
          this.playerAirHeight = 0.92;
          this.playerYVelocity = 0;
          this.showMessage("Nhảy qua đệm thấp!");
        } else this.jump();
      } else this.slide();
      return;
    }
    const nearbyStar = this.entities.find((entity) => entity.kind === "star" && entity.node.position.z < 14 && entity.node.position.z > 0);
    if (nearbyStar) {
      const desiredLane = LANES.findIndex((lane) => Math.abs(lane - nearbyStar.node.position.x) < 0.25);
      if (desiredLane !== -1) this.targetLane = desiredLane;
    }
  }
}
