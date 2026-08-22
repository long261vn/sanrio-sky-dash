import { describe, expect, it } from "vitest";
import { SCORE_RULES, nextComboAfterGust, nextComboAfterStar, scoreForDistance, scoreForGust, scoreForStar } from "../shared/scoring";

describe("hệ điểm không phụ thuộc sao", () => {
  it("tính điểm chạy chỉ theo quãng đường", () => {
    expect(scoreForDistance(12, 1)).toBe(72);
    expect(scoreForDistance(12, 1.6)).toBe(72);
  });

  it("không thưởng sao hoặc combo, còn vòng gió là phần thưởng cố định", () => {
    expect(scoreForStar(1.2, 1.05)).toBe(0);
    expect(nextComboAfterStar(1.2)).toBe(1);
    expect(scoreForGust(1.4)).toBe(40);
    expect(nextComboAfterGust(4.8)).toBe(1);
    expect(SCORE_RULES.starGoalBonus).toBe(0);
  });
});
