/** Chạy Đua Cùng Hana: âm thanh chỉ phát sau một thao tác thực của người chơi. */
import { assetUrl } from "@/lib/assets";

type EffectName = "button" | "star" | "jump" | "slide" | "shield" | "gameover";

const BGM_URL = assetUrl("hana-sky-dash-bgm_c55c1f2d.mp3");
const EFFECT_URLS: Record<EffectName, string> = {
  button: assetUrl("button_7261cff8.mp3"),
  star: assetUrl("star_42549186.mp3"),
  jump: assetUrl("jump_ae7164a5.mp3"),
  slide: assetUrl("slide_52cc7eb5.mp3"),
  shield: assetUrl("shield_492fe0ae.mp3"),
  gameover: assetUrl("gameover_34b8453a.mp3"),
};

export class AudioManager {
  private readonly bgm = new Audio(BGM_URL);
  private readonly effects: Record<EffectName, HTMLAudioElement>;
  private enabled = true;
  private unlocked = false;

  constructor() {
    this.bgm.loop = true;
    this.bgm.preload = "auto";
    this.bgm.volume = 0.38;
    this.bgm.load();
    this.effects = Object.fromEntries(
      Object.entries(EFFECT_URLS).map(([name, url]) => {
        const audio = new Audio(url);
        audio.preload = "auto";
        audio.volume = name === "gameover" ? 0.42 : 0.55;
        return [name, audio];
      }),
    ) as Record<EffectName, HTMLAudioElement>;
  }

  get isEnabled() {
    return this.enabled;
  }

  async toggle(shouldResume: boolean) {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.bgm.pause();
      return false;
    }
    return shouldResume ? this.startMusic() : true;
  }

  async startMusic() {
    if (!this.enabled) return false;
    this.unlocked = true;
    this.bgm.muted = false;
    try {
      await this.bgm.play();
      return true;
    } catch {
      return false;
    }
  }

  pauseMusic() {
    this.bgm.pause();
  }

  stopMusic() {
    this.bgm.pause();
    this.bgm.currentTime = 0;
  }

  play(effect: EffectName) {
    if (!this.enabled) return;
    this.unlocked = true;
    const sound = this.effects[effect];
    sound.currentTime = 0;
    void sound.play().catch(() => undefined);
  }

  dispose() {
    this.stopMusic();
    Object.values(this.effects).forEach((effect) => {
      effect.pause();
      effect.currentTime = 0;
    });
  }
}
