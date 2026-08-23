export type CharacterId =
  | "cinnamoroll"
  | "pompompurin"
  | "mymelody"
  | "kuromi"
  | "badtzmaru"
  | "keroppi"
  | "gudetama"
  | "hellokitty";

export type GameStatus = "menu" | "playing" | "paused" | "gameover";

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  tagline: string;
  icon: string;
  body: string;
  accent: string;
  accentSoft: string;
  portrait: string;
  silhouette: "cloud" | "pudding" | "bunny" | "imp" | "penguin" | "frog" | "egg" | "kitty";
  jumpForce: number;
  slideDuration: number;
  starBonus: number;
  shieldSeconds: number;
}

export const CHARACTERS: CharacterDefinition[] = [
  { id: "cinnamoroll", name: "Cinnamoroll", tagline: "Mây bông bứt tốc", icon: "☁", body: "#F7FCFF", accent: "#80C7F8", accentSoft: "#DDF1FF", portrait: "/manus-storage/sky-dash-cinnamoroll-portrait_2d1461bb.png", silhouette: "cloud", jumpForce: 11.5, slideDuration: 0.62, starBonus: 1.05, shieldSeconds: 5 },
  { id: "pompompurin", name: "Pompompurin", tagline: "Pudding êm ái", icon: "🍮", body: "#F5C56F", accent: "#8A5A35", accentSoft: "#FFF1C8", portrait: "/manus-storage/sky-dash-pompompurin-portrait-v2_d18be9f4.png", silhouette: "pudding", jumpForce: 10.4, slideDuration: 0.76, starBonus: 1.14, shieldSeconds: 5 },
  { id: "mymelody", name: "My Melody", tagline: "Bước chân hoa hồng", icon: "✿", body: "#FFF8F8", accent: "#F27FA6", accentSoft: "#FFE0EA", portrait: "/manus-storage/sky-dash-mymelody-portrait-v2_b559f59d.png", silhouette: "bunny", jumpForce: 11.1, slideDuration: 0.67, starBonus: 1.08, shieldSeconds: 5 },
  { id: "kuromi", name: "Kuromi", tagline: "Tinh nghịch đúng lúc", icon: "✦", body: "#F6F2FF", accent: "#7F52A3", accentSoft: "#EBDFFF", portrait: "/manus-storage/sky-dash-kuromi-portrait-v2_7d3f96a4.png", silhouette: "imp", jumpForce: 11.3, slideDuration: 0.66, starBonus: 1.1, shieldSeconds: 5 },
  { id: "badtzmaru", name: "Badtz-Maru", tagline: "Chất chơi trên mây", icon: "◆", body: "#2C3541", accent: "#F1C83B", accentSoft: "#E5ECF1", portrait: "/manus-storage/sky-dash-badtzmaru-portrait-v2_c495f683.png", silhouette: "penguin", jumpForce: 10.6, slideDuration: 0.82, starBonus: 1.03, shieldSeconds: 5.5 },
  { id: "keroppi", name: "Keroppi", tagline: "Nhảy thật cao", icon: "●", body: "#83CE7E", accent: "#E45F8D", accentSoft: "#DFFFF1", portrait: "/manus-storage/sky-dash-keroppi-portrait-v2_f7ca91aa.png", silhouette: "frog", jumpForce: 12.2, slideDuration: 0.6, starBonus: 1, shieldSeconds: 5 },
  { id: "gudetama", name: "Gudetama", tagline: "Chậm mà chắc", icon: "◒", body: "#FFCE42", accent: "#FFFFFF", accentSoft: "#FFF4C8", portrait: "/manus-storage/sky-dash-gudetama-portrait-v2_be6dabcb.png", silhouette: "egg", jumpForce: 9.9, slideDuration: 0.95, starBonus: 1.18, shieldSeconds: 5.5 },
  { id: "hellokitty", name: "Hello Kitty", tagline: "Nơ đỏ may mắn", icon: "♥", body: "#FFFDF8", accent: "#ED5E6E", accentSoft: "#FFE1E4", portrait: "/manus-storage/sky-dash-hellokitty-portrait-v2_f9685a82.png", silhouette: "kitty", jumpForce: 10.9, slideDuration: 0.71, starBonus: 1.12, shieldSeconds: 5 },
];

export type GameCommand =
  | { type: "start"; characterId?: CharacterId }
  | { type: "select"; characterId: CharacterId }
  | { type: "lane"; direction: -1 | 1 }
  | { type: "jump" }
  | { type: "slide" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "restart" }
  | { type: "menu" }
  | { type: "toggleAudio" }
  | { type: "practice"; characterId?: CharacterId };

export interface GameSnapshot {
  status: GameStatus;
  characterId: CharacterId;
  score: number;
  highScore: number;
  stars: number;
  distance: number;
  multiplier: number;
  shieldSeconds: number;
  missionProgress: number;
  message: string;
  isNewRecord: boolean;
  audioEnabled: boolean;
  difficultyLevel: number;
  speed: number;
  actionHint: "jump" | "slide" | null;
  isPractice: boolean;
  practiceStep: number;
}
