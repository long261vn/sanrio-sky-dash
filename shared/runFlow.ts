/** Luật UX: tên hợp lệ là điều kiện bắt đầu; Cinnamoroll luôn là mascot mặc định nếu người chơi không đổi. */
export function canStartSkyDashRun(playerName: string) {
  return !needsLeaderboardName(playerName);
}

export function needsLeaderboardName(playerName: string) {
  return playerName.trim().length < 2;
}
