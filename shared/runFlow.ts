/** Luật UX: mọi người chơi đều được bắt đầu; tên chỉ cần khi muốn ghi Top 30. */
export function canStartSkyDashRun(playerName: string, hasSelectedCharacter: boolean) {
  return hasSelectedCharacter && !needsLeaderboardName(playerName);
}

export function needsLeaderboardName(playerName: string) {
  return playerName.trim().length < 2;
}
