export type AchievementCardInput = {
  playerName: string;
  characterIcon: string;
  characterName: string;
  characterPortrait: string;
  characterBody: string;
  characterAccent: string;
  score: number;
  distance: number;
  level: number;
  rank: number | null;
};

const WIDTH = 1080;
const HEIGHT = 1350;

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function cloud(context: CanvasRenderingContext2D, x: number, y: number, scale: number, alpha = 1) {
  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(x, y, 42 * scale, 0, Math.PI * 2);
  context.arc(x + 55 * scale, y - 28 * scale, 58 * scale, 0, Math.PI * 2);
  context.arc(x + 118 * scale, y, 47 * scale, 0, Math.PI * 2);
  context.arc(x + 65 * scale, y + 25 * scale, 65 * scale, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawText(context: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left") {
  context.font = font;
  context.fillStyle = color;
  context.textAlign = align;
  context.fillText(text, x, y);
}

function loadPortrait(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Không tải được chân dung mascot."));
    image.src = src;
  });
}

async function drawMascotPortrait(context: CanvasRenderingContext2D, input: AchievementCardInput) {
  const size = 252;
  context.save();
  context.beginPath();
  context.arc(WIDTH / 2, 430, 126, 0, Math.PI * 2);
  context.clip();
  try {
    const portrait = await loadPortrait(input.characterPortrait);
    const scale = Math.max(size / portrait.width, size / portrait.height);
    const width = portrait.width * scale;
    const height = portrait.height * scale;
    context.drawImage(portrait, WIDTH / 2 - width / 2, 430 - height / 2, width, height);
  } catch {
    context.fillStyle = input.characterBody;
    context.fillRect(WIDTH / 2 - size / 2, 430 - size / 2, size, size);
    drawText(context, input.characterIcon, WIDTH / 2, 480, "190px system-ui", input.characterAccent, "center");
  }
  context.restore();
}

export async function createAchievementCard(input: AchievementCardInput) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Không thể tạo thẻ thành tích trên thiết bị này.");

  const sky = context.createLinearGradient(0, 0, WIDTH, HEIGHT);
  sky.addColorStop(0, "#bcefff");
  sky.addColorStop(0.5, "#e9f9ff");
  sky.addColorStop(1, "#ffd8e8");
  context.fillStyle = sky;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  cloud(context, 88, 125, 1.45, 0.9);
  cloud(context, 760, 190, 1.2, 0.86);
  cloud(context, 420, 1120, 1.8, 0.75);

  context.fillStyle = "rgba(255,255,255,.36)";
  context.beginPath();
  context.arc(880, 490, 180, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "rgba(255,211,94,.82)";
  context.beginPath();
  context.arc(910, 460, 22, 0, Math.PI * 2);
  context.fill();
  drawText(context, "★", 904, 480, "70px system-ui", "#fff8c9", "center");

  roundedRect(context, 74, 82, 932, 1138, 56);
  context.fillStyle = "rgba(255,253,246,.95)";
  context.fill();
  context.lineWidth = 8;
  context.strokeStyle = "rgba(255,255,255,.92)";
  context.stroke();

  drawText(context, "CHẠY ĐUA CÙNG HANA", WIDTH / 2, 182, "900 34px system-ui", "#43716d", "center");
  drawText(context, "THẺ THÀNH TÍCH BẦU TRỜI", WIDTH / 2, 235, "900 21px system-ui", "#ce7191", "center");
  context.strokeStyle = "#f2c859";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(360, 263);
  context.lineTo(720, 263);
  context.stroke();

  context.fillStyle = input.characterBody;
  context.beginPath();
  context.arc(WIDTH / 2, 430, 150, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 10;
  context.strokeStyle = input.characterAccent;
  context.stroke();
  await drawMascotPortrait(context, input);
  drawText(context, input.playerName || input.characterName, WIDTH / 2, 640, "900 52px system-ui", "#314962", "center");
  drawText(context, `Đã chạy cùng ${input.characterName}`, WIDTH / 2, 682, "700 23px system-ui", "#6d8992", "center");

  roundedRect(context, 152, 736, 776, 170, 30);
  context.fillStyle = "#fff3bd";
  context.fill();
  drawText(context, "ĐIỂM BAY", WIDTH / 2, 786, "900 21px system-ui", "#9d7440", "center");
  drawText(context, input.score.toLocaleString("vi-VN"), WIDTH / 2, 868, "900 86px system-ui", "#31506e", "center");

  const stats = [
    { label: "QUÃNG ĐƯỜNG", value: `${input.distance}m` },
    { label: "CẤP ĐẠT", value: `${input.level}` },
    { label: "TOP 20", value: input.rank ? `#${input.rank}` : "CỐ GẮNG" },
  ];
  stats.forEach((stat, index) => {
    const x = 152 + index * 259;
    roundedRect(context, x, 944, 242, 145, 24);
    context.fillStyle = index === 2 && input.rank ? "#f7e6ff" : "#e8f7f7";
    context.fill();
    drawText(context, stat.label, x + 121, 993, "900 16px system-ui", "#66848a", "center");
    drawText(context, stat.value, x + 121, 1058, "900 35px system-ui", "#345470", "center");
  });

  drawText(context, input.rank ? `Hạng #${input.rank} · Bạn đã chinh phục bầu trời tuần này!` : "Nhảy, trượt và đổi làn để bay xa hơn ở lượt tới!", WIDTH / 2, 1155, "800 18px system-ui", "#68808a", "center");
  drawText(context, "☁  Chơi cùng Hana · Mỗi lượt bay đều là một ngôi sao mới  ☁", WIDTH / 2, 1193, "700 15px system-ui", "#8a9da2", "center");

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Không thể xuất thẻ thành tích PNG.");
  return { blob, filename: `thanh-tich-${input.characterName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${input.score}-${input.distance}m.png` };
}

export function downloadAchievementCard(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}
