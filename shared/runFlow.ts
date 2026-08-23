/** Luật UX: tên và nhân vật được chọn trước lượt chạy để sẵn sàng ghi Top 20. */
export function canStartSkyDashRun(playerName: string, hasSelectedCharacter: boolean) {
  return hasSelectedCharacter && !needsLeaderboardName(playerName);
}

export function needsLeaderboardName(playerName: string) {
  return playerName.trim().length < 2;
}
