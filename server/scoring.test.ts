import { describe, expect, it } from "vitest";
import { SCORE_RULES, nextComboAfterGust, nextComboAfterStar, scoreForDistance, scoreForGust, scoreForStar } from "../shared/scoring";

describe("hệ sao và điểm", () => {
  it("tính điểm chạy theo quãng đường và combo", () => {
    expect(scoreForDistance(12, 1)).toBe(96);
    expect(scoreForDistance(12, 1.6)).toBeCloseTo(153.6);
  });

  it("cho sao và vòng gió tác động rõ ràng lên điểm/combo", () => {
    expect(scoreForStar(1.2, 1.05)).toBeCloseTo(37.8);
    expect(nextComboAfterStar(1.2)).toBe(1.4);
    expect(scoreForGust(1.4)).toBeCloseTo(126);
    expect(nextComboAfterGust(4.8)).toBe(5);
    expect(SCORE_RULES.starGoalBonus).toBe(250);
  });
});
