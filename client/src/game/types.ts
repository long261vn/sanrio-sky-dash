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
}

export const CHARACTERS: CharacterDefinition[] = [
  { id: "cinnamoroll", name: "Cinnamoroll", tagline: "Mây bông bứt tốc", icon: "☁", body: "#F7FCFF", accent: "#80C7F8", accentSoft: "#DDF1FF" },
  { id: "pompompurin", name: "Pompompurin", tagline: "Pudding êm ái", icon: "🍮", body: "#F5C56F", accent: "#8A5A35", accentSoft: "#FFF1C8" },
  { id: "mymelody", name: "My Melody", tagline: "Bước chân hoa hồng", icon: "✿", body: "#FFF8F8", accent: "#F27FA6", accentSoft: "#FFE0EA" },
  { id: "kuromi", name: "Kuromi", tagline: "Tinh nghịch đúng lúc", icon: "✦", body: "#F6F2FF", accent: "#7F52A3", accentSoft: "#EBDFFF" },
  { id: "badtzmaru", name: "Badtz-Maru", tagline: "Chất chơi trên mây", icon: "◆", body: "#2C3541", accent: "#F1C83B", accentSoft: "#E5ECF1" },
  { id: "keroppi", name: "Keroppi", tagline: "Nhảy thật cao", icon: "●", body: "#83CE7E", accent: "#E45F8D", accentSoft: "#DFFFF1" },
  { id: "gudetama", name: "Gudetama", tagline: "Chậm mà chắc", icon: "◒", body: "#FFCE42", accent: "#FFFFFF", accentSoft: "#FFF4C8" },
  { id: "hellokitty", name: "Hello Kitty", tagline: "Nơ đỏ may mắn", icon: "♥", body: "#FFFDF8", accent: "#ED5E6E", accentSoft: "#FFE1E4" },
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
  | { type: "menu" };

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
}
