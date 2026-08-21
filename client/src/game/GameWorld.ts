import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { GameCommand, GameSnapshot, GameStatus, CharacterId, CHARACTERS } from "@/game/types";

type EntityKind = "macaron" | "storm" | "star" | "shield" | "gust";

interface WorldEntity {
  node: TransformNode;
  kind: EntityKind;
  lane: number;
  spin: number;
}

const LANES = [-2.6, 0, 2.6];
const PLAYER_Z = 0;
const STAR_GOAL = 10;

const getCharacter = (id: CharacterId) => CHARACTERS.find((character) => character.id === id) ?? CHARACTERS[0];

export class GameWorld {
  private readonly scene: Scene;
  private readonly canvas: HTMLCanvasElement;
  private readonly entities: WorldEntity[] = [];
  private readonly decorations: TransformNode[] = [];
  private readonly rngSeed = 9711;
  private randomState = this.rngSeed;
  private status: GameStatus = "menu";
  private characterId: CharacterId = "cinnamoroll";
  private player: TransformNode | null = null;
  private playerYVelocity = 0;
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
  private message = "Chọn một người bạn để bắt đầu chuyến bay.";
  private messageTimer = 0;
  private stateTimer = 0;
  private elapsed = 0;
  private missionAnnounced = false;
  private newRecord = false;
  private readonly demo = new URLSearchParams(window.location.search).has("demo");
  private pointerStart: { x: number; y: number } | null = null;

  private readonly onCommand = (event: Event) => this.handleCommand((event as CustomEvent<GameCommand>).detail);
  private readonly onKeyDown = (event: KeyboardEvent) => this.handleKey(event);
  private readonly onPointerDown = (event: PointerEvent) => {
    this.pointerStart = { x: event.clientX, y: event.clientY };
  };
  private readonly onPointerUp = (event: PointerEvent) => this.handleSwipe(event);

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
    this.emitState();
    if (this.demo) window.setTimeout(() => this.start(), 250);
  }

  update(delta: number) {
    this.elapsed += delta;
    this.updateDecorations(delta);
    if (this.status !== "playing") return;

    const speed = Math.min(21, 10 + this.distance / 130);
    this.distance += speed * delta * 0.43;
    this.score += speed * delta * 3.5 * this.multiplier;
    this.spawnTimer -= delta;
    this.slideTimer = Math.max(0, this.slideTimer - delta);
    this.shieldTimer = Math.max(0, this.shieldTimer - delta);
    this.messageTimer = Math.max(0, this.messageTimer - delta);

    this.updatePlayer(delta);
    this.updateEntities(delta, speed);
    if (this.spawnTimer <= 0) {
      this.spawnBeat();
      this.spawnTimer = Math.max(0.56, 1.25 - this.distance / 900) + this.random() * 0.38;
    }
    if (this.demo) this.runDemoBrain();
    if (this.stars >= STAR_GOAL && !this.missionAnnounced) {
      this.missionAnnounced = true;
      this.showMessage("Nhiệm vụ hoàn tất! Thêm 250 điểm.");
      this.score += 250;
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
    this.entities.forEach((entity) => entity.node.dispose(false, true));
    this.decorations.forEach((node) => node.dispose(false, true));
    this.player?.dispose(false, true);
  }

  private handleCommand(command: GameCommand) {
    if (!command) return;
    if (command.type === "start") this.start(command.characterId);
    if (command.type === "select") this.selectCharacter(command.characterId);
    if (command.type === "lane" && this.status === "playing") this.changeLane(command.direction);
    if (command.type === "jump" && this.status === "playing") this.jump();
    if (command.type === "slide" && this.status === "playing") this.slide();
    if (command.type === "pause" && this.status === "playing") this.setStatus("paused", "Trên mây cũng cần nghỉ một nhịp.");
    if (command.type === "resume" && this.status === "paused") this.setStatus("playing", "Bay tiếp nào!");
    if (command.type === "restart") this.start();
    if (command.type === "menu") this.setStatus("menu", "Chọn một người bạn để bắt đầu chuyến bay.");
  }

  private handleKey(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s", " ", "escape"].includes(key)) event.preventDefault();
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
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 26) this.changeLane(dx > 0 ? 1 : -1);
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 26) dy < 0 ? this.jump() : this.slide();
  }

  private setStatus(status: GameStatus, message?: string) {
    this.status = status;
    if (message) this.showMessage(message);
    this.emitState();
  }

  private start(characterId?: CharacterId) {
    if (characterId) this.selectCharacter(characterId);
    this.entities.splice(0).forEach((entity) => entity.node.dispose(false, true));
    this.randomState = this.rngSeed;
    this.score = 0;
    this.stars = 0;
    this.distance = 0;
    this.multiplier = 1;
    this.playerLane = 1;
    this.targetLane = 1;
    this.playerYVelocity = 0;
    this.slideTimer = 0;
    this.shieldTimer = 0;
    this.spawnTimer = 0.55;
    this.missionAnnounced = false;
    this.newRecord = false;
    if (this.player) this.player.position = new Vector3(0, 0, PLAYER_Z);
    this.setStatus("playing", "Lướt qua mây, gom điều ước!");
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
    if (!this.player || this.player.position.y > 0.03 || this.slideTimer > 0) return;
    this.playerYVelocity = 10.7;
    this.showMessage("Nhảy thật cao!");
  }

  private slide() {
    if (!this.player || this.player.position.y > 0.08) return;
    this.slideTimer = 0.62;
    this.showMessage("Lướt qua nào!");
  }

  private updatePlayer(delta: number) {
    if (!this.player) return;
    const targetX = LANES[this.targetLane];
    this.player.position.x += (targetX - this.player.position.x) * Math.min(1, delta * 12);
    this.playerYVelocity -= 26 * delta;
    this.player.position.y = Math.max(0, this.player.position.y + this.playerYVelocity * delta);
    if (this.player.position.y <= 0) this.playerYVelocity = 0;
    const runningBob = Math.sin(this.elapsed * 15) * 0.055;
    this.player.rotation.z = Math.sin(this.elapsed * 11) * 0.045;
    this.player.position.y += runningBob * (this.player.position.y <= 0.001 ? 1 : 0.15);
    if (this.player.position.y < 0) this.player.position.y = 0;
    this.player.scaling.y = this.slideTimer > 0 ? 0.76 : 1.34;
    this.player.scaling.x = this.slideTimer > 0 ? 1.52 : 1.34;
    this.player.scaling.z = 1.34;
    const shieldRing = this.player.getChildMeshes().find((mesh) => mesh.name === "shieldRing");
    if (shieldRing) shieldRing.isVisible = this.shieldTimer > 0;
  }

  private updateEntities(delta: number, speed: number) {
    for (let index = this.entities.length - 1; index >= 0; index -= 1) {
      const entity = this.entities[index];
      entity.node.position.z -= speed * delta;
      entity.node.rotation.y += entity.spin * delta;
      entity.node.position.y += Math.sin(this.elapsed * 5 + index) * delta * 0.1;
      if (entity.node.position.z < -9) {
        entity.node.dispose(false, true);
        this.entities.splice(index, 1);
        continue;
      }
      if (Math.abs(entity.node.position.z - PLAYER_Z) < 1.2 && Math.abs(entity.node.position.x - (this.player?.position.x ?? 0)) < 1.08) {
        if (entity.kind === "star") {
          this.stars += 1;
          this.score += 30 * this.multiplier;
          this.multiplier = Math.min(5, this.multiplier + 0.2);
          this.showMessage("+1 sao điều ước");
          this.removeEntity(index);
          continue;
        }
        if (entity.kind === "shield") {
          this.shieldTimer = 5;
          this.showMessage("Khiên cầu vồng: 5 giây!");
          this.removeEntity(index);
          continue;
        }
        if (entity.kind === "gust") {
          this.score += 90;
          this.showMessage("Gió mint: +90 điểm!");
          this.removeEntity(index);
          continue;
        }
        const safeFromMacaron = entity.kind === "macaron" && (this.player?.position.y ?? 0) > 1.05;
        const safeFromStorm = entity.kind === "storm" && this.slideTimer > 0.08;
        if (safeFromMacaron || safeFromStorm) {
          this.score += 18 * this.multiplier;
          this.removeEntity(index);
          continue;
        }
        if (this.shieldTimer > 0) {
          this.shieldTimer = 0;
          this.showMessage("Khiên đã che chắn bạn!");
          this.removeEntity(index);
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

  private endRun() {
    const finalScore = Math.floor(this.score);
    this.newRecord = finalScore > this.highScore;
    if (this.newRecord) {
      this.highScore = finalScore;
      window.localStorage.setItem("skyDashHighScore", String(this.highScore));
    }
    this.setStatus("gameover", this.newRecord ? "Kỷ lục mới! Bầu trời vỗ tay cho bạn." : "Chuyến bay kết thúc, thử thêm một lần nữa nhé.");
  }

  private spawnBeat() {
    const lane = Math.floor(this.random() * 3);
    const roll = this.random();
    if (roll < 0.48) {
      this.spawnEntity(this.random() < 0.57 ? "macaron" : "storm", lane, 31);
      if (this.random() < 0.55) this.spawnEntity("star", (lane + 1) % 3, 37);
      return;
    }
    if (roll < 0.78) {
      this.spawnEntity("star", lane, 30);
      this.spawnEntity("star", lane, 35);
      if (this.random() < 0.45) this.spawnEntity("star", lane, 40);
      return;
    }
    this.spawnEntity(roll < 0.89 ? "shield" : "gust", lane, 32);
  }

  private spawnEntity(kind: EntityKind, lane: number, z: number) {
    const node = new TransformNode(`${kind}-${this.elapsed.toFixed(2)}`, this.scene);
    node.position = new Vector3(LANES[lane], kind === "storm" ? 1.2 : 0.65, z);
    if (kind === "macaron") this.createMacaron(node);
    if (kind === "storm") this.createStorm(node);
    if (kind === "star") this.createStar(node);
    if (kind === "shield") this.createShield(node);
    if (kind === "gust") this.createGust(node);
    this.entities.push({ node, kind, lane, spin: kind === "star" || kind === "shield" ? 2.8 : 0.35 });
  }

  private buildTrack() {
    const trackMaterial = this.material("cloudRibbon", "#F4D7B7", 0.025);
    const laneMaterial = this.material("laneSeam", "#EFA1A2", 0.03);
    const edgeMaterial = this.material("trackEdge", "#F8C85E", 0.07);
    const track = MeshBuilder.CreateGround("cloudRibbonTrack", { width: 9.15, height: 112, subdivisions: 2 }, this.scene);
    track.position.z = 44;
    track.material = trackMaterial;
    for (const x of [-1.3, 1.3]) {
      const seam = MeshBuilder.CreateBox(`laneSeam${x}`, { width: 0.09, height: 0.08, depth: 112 }, this.scene);
      seam.position = new Vector3(x, 0.035, 44);
      seam.material = laneMaterial;
    }
    for (const x of [-4.62, 4.62]) {
      const rail = MeshBuilder.CreateBox(`puffyRail${x}`, { width: 0.28, height: 0.27, depth: 112 }, this.scene);
      rail.position = new Vector3(x, 0.18, 44);
      rail.material = edgeMaterial;
    }
    for (let z = 4; z < 105; z += 8) {
      const star = MeshBuilder.CreatePolyhedron(`trackStar${z}`, { type: 1, size: 0.15 }, this.scene);
      star.position = new Vector3(0, 0.11, z);
      star.material = edgeMaterial;
      star.rotation.y = Math.PI / 4;
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
    const root = new TransformNode("runner", this.scene);
    root.position = new Vector3(LANES[this.playerLane], 0, PLAYER_Z);
    const body = this.material(`body-${character.id}`, character.body, 0.04);
    const accent = this.material(`accent-${character.id}`, character.accent, 0.11);
    const softAccent = this.material(`soft-${character.id}`, character.accentSoft, 0.05);
    const ink = this.material("blueberryInk", "#31445D", 0.02);

    const torso = MeshBuilder.CreateSphere("runnerBody", { diameter: 1.35, segments: 20 }, this.scene);
    torso.parent = root;
    torso.position = new Vector3(0, 0.74, 0);
    torso.scaling = new Vector3(0.95, 1.05, 0.78);
    torso.material = body;
    const head = MeshBuilder.CreateSphere("runnerHead", { diameter: 1.45, segments: 20 }, this.scene);
    head.parent = root;
    head.position = new Vector3(0, 1.58, -0.03);
    head.material = body;
    const leftEye = MeshBuilder.CreateSphere("eyeLeft", { diameter: 0.13 }, this.scene);
    leftEye.parent = root;
    leftEye.position = new Vector3(-0.26, 1.66, -0.68);
    leftEye.material = ink;
    const rightEye = leftEye.clone("eyeRight");
    if (rightEye) {
      rightEye.parent = root;
      rightEye.position.x = 0.26;
    }
    const blush = this.material("blush", "#F6A4B8", 0.06);
    for (const x of [-0.43, 0.43]) {
      const cheek = MeshBuilder.CreateSphere(`cheek${x}`, { diameter: 0.18 }, this.scene);
      cheek.parent = root;
      cheek.position = new Vector3(x, 1.47, -0.65);
      cheek.scaling.x = 1.45;
      cheek.material = blush;
    }
    const earScale = character.id === "cinnamoroll" || character.id === "mymelody" || character.id === "kuromi" ? 1.55 : 0.72;
    for (const x of [-0.47, 0.47]) {
      const ear = MeshBuilder.CreateSphere(`ear${x}`, { diameter: 0.55 }, this.scene);
      ear.parent = root;
      ear.position = new Vector3(x, 2.2, 0.01);
      ear.scaling = new Vector3(0.62, earScale, 0.46);
      ear.rotation.z = x < 0 ? 0.24 : -0.24;
      ear.material = character.id === "kuromi" || character.id === "mymelody" ? accent : body;
    }
    const scarf = MeshBuilder.CreateTorus("scarf", { diameter: 1.1, thickness: 0.15, tessellation: 20 }, this.scene);
    scarf.parent = root;
    scarf.position = new Vector3(0, 1.03, -0.04);
    scarf.rotation.x = Math.PI / 2;
    scarf.material = accent;
    const shieldRing = MeshBuilder.CreateTorus("shieldRing", { diameter: 2.5, thickness: 0.09, tessellation: 32 }, this.scene);
    shieldRing.parent = root;
    shieldRing.position.y = 1.25;
    shieldRing.rotation.x = Math.PI / 2;
    shieldRing.material = softAccent;
    shieldRing.isVisible = false;
    this.player = root;
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

  private createMacaron(root: TransformNode) {
    const pink = this.material(`macaronPink-${this.elapsed}`, "#FF9FB3", 0.08);
    const cream = this.material(`macaronCream-${this.elapsed}`, "#FFF4DC", 0.03);
    for (const [y, material] of [[0.38, pink], [0.68, cream], [0.98, pink]] as const) {
      const layer = MeshBuilder.CreateCylinder(`macaronLayer-${y}`, { diameter: 1.55, height: y === 0.68 ? 0.17 : 0.31, tessellation: 20 }, this.scene);
      layer.parent = root;
      layer.position.y = y;
      layer.material = material;
    }
  }

  private createStorm(root: TransformNode) {
    const cloud = this.material(`stormCloud-${this.elapsed}`, "#B9A6D1", 0.04);
    const bolt = this.material(`stormBolt-${this.elapsed}`, "#FFD66B", 0.42);
    this.createCloud(root, cloud, 0.75);
    const lightning = MeshBuilder.CreatePolyhedron("stormBolt", { type: 1, size: 0.44 }, this.scene);
    lightning.parent = root;
    lightning.position = new Vector3(0, -0.55, -0.1);
    lightning.scaling.y = 1.45;
    lightning.material = bolt;
  }

  private createStar(root: TransformNode) {
    const star = MeshBuilder.CreatePolyhedron("wishStar", { type: 1, size: 0.53 }, this.scene);
    star.parent = root;
    star.material = this.material(`wishStar-${this.elapsed}`, "#FFD66B", 0.62);
    const ring = MeshBuilder.CreateTorus("starHalo", { diameter: 1.05, thickness: 0.04, tessellation: 20 }, this.scene);
    ring.parent = root;
    ring.rotation.x = Math.PI / 2;
    ring.material = this.material(`starHalo-${this.elapsed}`, "#FFFFFF", 0.35);
  }

  private createShield(root: TransformNode) {
    const bubble = MeshBuilder.CreateSphere("rainbowBubble", { diameter: 1.15, segments: 20 }, this.scene);
    bubble.parent = root;
    const bubbleMaterial = this.material(`bubble-${this.elapsed}`, "#BFE9FF", 0.35);
    bubbleMaterial.alpha = 0.56;
    bubble.material = bubbleMaterial;
    const rainbow = MeshBuilder.CreateTorus("bubbleRainbow", { diameter: 0.65, thickness: 0.1, tessellation: 20 }, this.scene);
    rainbow.parent = root;
    rainbow.rotation.x = Math.PI / 2;
    rainbow.material = this.material(`bubbleRainbow-${this.elapsed}`, "#FF9FB3", 0.5);
  }

  private createGust(root: TransformNode) {
    const gustMaterial = this.material(`gust-${this.elapsed}`, "#7ED8C7", 0.28);
    for (const y of [-0.2, 0.08, 0.36]) {
      const curl = MeshBuilder.CreateTorus(`gustCurl-${y}`, { diameter: 0.7 - y * 0.2, thickness: 0.11, tessellation: 20 }, this.scene);
      curl.parent = root;
      curl.position.y = y;
      curl.rotation.x = Math.PI / 2;
      curl.material = gustMaterial;
    }
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
      missionProgress: Math.min(STAR_GOAL, this.stars),
      message: this.messageTimer > 0 || this.status !== "playing" ? this.message : "",
      isNewRecord: this.newRecord,
    };
    window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: snapshot }));
  }

  private random() {
    this.randomState = (this.randomState * 9301 + 49297) % 233280;
    return this.randomState / 233280;
  }

  private runDemoBrain() {
    const imminent = this.entities.find((entity) => (entity.kind === "macaron" || entity.kind === "storm") && entity.node.position.z < 7 && entity.node.position.z > -0.4 && Math.abs(entity.node.position.x - (this.player?.position.x ?? 0)) < 1.1);
    if (imminent) {
      if (imminent.kind === "macaron") this.jump();
      else this.slide();
      return;
    }
    const nearbyStar = this.entities.find((entity) => entity.kind === "star" && entity.node.position.z < 14 && entity.node.position.z > 0);
    if (nearbyStar) {
      const desiredLane = LANES.findIndex((lane) => Math.abs(lane - nearbyStar.node.position.x) < 0.25);
      if (desiredLane !== -1) this.targetLane = desiredLane;
    }
  }
}
