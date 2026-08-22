export const SCORE_RULES = {
  basePointsPerMeter: 8,
  starBasePoints: 30,
  starComboGain: 0.2,
  starGoal: 10,
  starGoalBonus: 250,
  hurdleClearPoints: 18,
  gustBasePoints: 90,
  gustComboGain: 0.5,
} as const;

export function scoreForDistance(meters: number, multiplier: number) {
  return meters * SCORE_RULES.basePointsPerMeter * multiplier;
}

export function scoreForStar(multiplier: number, starBonus: number) {
  return SCORE_RULES.starBasePoints * multiplier * starBonus;
}

export function scoreForClear(multiplier: number) {
  return SCORE_RULES.hurdleClearPoints * multiplier;
}

export function scoreForGust(multiplier: number) {
  return SCORE_RULES.gustBasePoints * multiplier;
}

export function nextComboAfterStar(multiplier: number) {
  return Math.min(5, multiplier + SCORE_RULES.starComboGain);
}

export function nextComboAfterGust(multiplier: number) {
  return Math.min(5, multiplier + SCORE_RULES.gustComboGain);
}
