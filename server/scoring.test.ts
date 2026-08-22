import { describe, expect, it } from "vitest";
import { SCORE_RULES, nextComboAfterGust, nextComboAfterStar, scoreForDistance, scoreForGust, scoreForStar } from "../shared/scoring";

describe("hệ điểm sao xu nhỏ, không combo", () => {
  it("tính điểm chạy chỉ theo quãng đường", () => {
    expect(scoreForDistance(12, 1)).toBe(72);
    expect(scoreForDistance(12, 1.6)).toBe(72);
  });

  it("thưởng sao xu nhỏ cố định, không combo; vòng gió vẫn cố định", () => {
    expect(scoreForStar(1.2, 1.05)).toBe(4);
    expect(nextComboAfterStar(1.2)).toBe(1);
    expect(scoreForGust(1.4)).toBe(40);
    expect(nextComboAfterGust(4.8)).toBe(1);
    expect(SCORE_RULES.starGoalBonus).toBe(0);
  });
});
