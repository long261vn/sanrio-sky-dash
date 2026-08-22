export const SCORE_RULES = {
  basePointsPerMeter: 6,
  starBasePoints: 0,
  starComboGain: 0,
  starGoal: 0,
  starGoalBonus: 0,
  hurdleClearPoints: 32,
  gustBasePoints: 40,
  gustComboGain: 0,
} as const;

export function scoreForDistance(meters: number, _multiplier: number) {
  return meters * SCORE_RULES.basePointsPerMeter;
}

export function scoreForStar(_multiplier: number, _starBonus: number) {
  return SCORE_RULES.starBasePoints;
}

export function scoreForClear(_multiplier: number) {
  return SCORE_RULES.hurdleClearPoints;
}

export function scoreForGust(_multiplier: number) {
  return SCORE_RULES.gustBasePoints;
}

export function nextComboAfterStar(_multiplier: number) {
  return 1;
}

export function nextComboAfterGust(_multiplier: number) {
  return 1;
}
