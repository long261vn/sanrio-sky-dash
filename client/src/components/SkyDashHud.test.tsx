// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { GameSnapshot } from "@/game/types";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  refetch: vi.fn(),
  setData: vi.fn(),
  leaderboardData: { seasonKey: "2026-08-22", rows: [] as any[] },
  mutationOptions: null as any,
}));

vi.mock("@/lib/assets", () => ({ assetUrl: (filename: string) => filename }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    leaderboard: {
      top20: { useQuery: () => ({ data: mocks.leaderboardData, refetch: mocks.refetch }) },
      submit: { useMutation: (options: any) => { mocks.mutationOptions = options; return { mutate: mocks.mutate, isPending: false }; } },
    },
    useUtils: () => ({ leaderboard: { top20: { setData: (...args: any[]) => { mocks.setData(...args); mocks.leaderboardData = args[1]; } } } }),
  },
}));

import SkyDashHud from "./SkyDashHud";

const gameoverSnapshot: GameSnapshot = {
  status: "gameover",
  characterId: "cinnamoroll",
  score: 180,
  highScore: 180,
  stars: 0,
  distance: 22,
  multiplier: 1,
  shieldSeconds: 0,
  missionProgress: 0,
  message: "Chuyến bay kết thúc, thử thêm một lần nữa nhé.",
  isNewRecord: false,
  audioEnabled: true,
  difficultyLevel: 1,
  speed: 10,
  actionHint: null,
  isPractice: false,
  practiceStep: 0,
};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  mocks.mutate.mockReset();
  mocks.refetch.mockReset();
  mocks.setData.mockReset();
  mocks.leaderboardData = { seasonKey: "2026-08-22", rows: [] };
  mocks.mutationOptions = null;
});

describe("SkyDashHud run flow", () => {
  it("requires a name and an explicit character choice before sending Start", () => {
    const commandListener = vi.fn();
    window.addEventListener("skydash:command", commandListener);
    render(<SkyDashHud />);

    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu hành trình" }));
    const runButton = screen.getByRole("button", { name: "Chạy cùng Cinnamoroll" });
    expect((runButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Mây Nhỏ" } });
    const cinnamorollCard = screen.getAllByRole("button").find((button) => button.classList.contains("character-card") && button.textContent?.includes("Cinnamoroll"));
    expect(cinnamorollCard).toBeTruthy();
    fireEvent.click(cinnamorollCard!);
    expect((runButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(runButton);

    expect(commandListener.mock.calls.map(([event]) => (event as CustomEvent).detail)).toEqual([
      { type: "select", characterId: "cinnamoroll" },
      { type: "start", characterId: "cinnamoroll" },
    ]);
    window.removeEventListener("skydash:command", commandListener);
  });

  it("shows a mandatory name field in setup before a run can begin", () => {
    render(<SkyDashHud />);

    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu hành trình" }));

    expect(screen.getByText("BƯỚC 1 · TÊN NGƯỜI CHƠI")).toBeTruthy();
    expect(screen.getByText("BẮT BUỘC")).toBeTruthy();
    expect(screen.getByText(/Cần: nhập tên/)).toBeTruthy();
  });

  it("opens a short paged tutorial and lets the player skip it at any step", () => {
    render(<SkyDashHud />);

    fireEvent.click(screen.getByRole("button", { name: "Hướng dẫn chơi" }));
    expect(screen.getByText("NHÓM 1 / 2 · VẬT PHẨM NÊN LẤY")).toBeTruthy();
    expect(screen.getByText("Khiên cầu vồng")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Xem chướng ngại" }));
    expect(screen.getByText("NHÓM 2 / 2 · CHƯỚNG NGẠI CẦN VƯỢT")).toBeTruthy();
    expect(screen.getByText("Cổng mây cao")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Bỏ qua/ }));
    expect(screen.queryByText("NHÓM 2 / 2 · CHƯỚNG NGẠI CẦN VƯỢT")).toBeNull();
  });

  it("renders all 20 ranked slots even when only a few players have submitted scores", () => {
    render(<SkyDashHud />);

    fireEvent.click(screen.getByRole("button", { name: "Xem Top 20" }));

    expect(screen.getByRole("list", { name: "20 hạng của tuần" })).toBeTruthy();
    expect(screen.getAllByText("Đang chờ chuyến bay")).toHaveLength(20);
  });

  it("sends lane, jump and slide commands from the touch controls during a run", () => {
    const commandListener = vi.fn();
    window.addEventListener("skydash:command", commandListener);
    render(<SkyDashHud />);

    act(() => {
      window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: { ...gameoverSnapshot, status: "playing" } }));
    });

    fireEvent.click(screen.getByRole("button", { name: "Sang làn trái" }));
    fireEvent.click(screen.getByRole("button", { name: "Nhảy" }));
    fireEvent.click(screen.getByRole("button", { name: "Sang làn phải" }));
    fireEvent.click(screen.getByRole("button", { name: "Trượt" }));

    expect(commandListener.mock.calls.map(([event]) => (event as CustomEvent).detail)).toEqual([
      { type: "lane", direction: -1 },
      { type: "jump" },
      { type: "lane", direction: 1 },
      { type: "slide" },
    ]);
    window.removeEventListener("skydash:command", commandListener);
  });

  it("keeps action feedback as a compact toast instead of rendering a large center callout", () => {
    const { container } = render(<SkyDashHud />);

    act(() => {
      window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: { ...gameoverSnapshot, status: "playing", message: "Nhảy qua đệm thấp!", actionHint: "jump" } }));
    });

    expect(screen.getByText("Nhảy qua đệm thấp!")).toBeTruthy();
    expect(container.querySelector(".action-callout")).toBeNull();
  });

  it("auto-saves two consecutive runs for one player and returns safely to the menu", async () => {
    window.localStorage.setItem("hanaSkyDashPlayerName", "Hana Test");
    const commandListener = vi.fn();
    window.addEventListener("skydash:command", commandListener);
    render(<SkyDashHud />);

    act(() => {
      window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: { ...gameoverSnapshot, score: 180, distance: 30 } }));
    });
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledTimes(1));

    act(() => {
      window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: { ...gameoverSnapshot, status: "playing" } }));
      window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: { ...gameoverSnapshot, score: 240, distance: 42 } }));
    });
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledTimes(2));
    expect(mocks.mutate.mock.calls[1][0]).toMatchObject({ playerName: "Hana Test", score: 240, distance: 42 });

    await act(async () => {
      await mocks.mutationOptions.onSuccess({ seasonKey: "2026-08-22", rows: [], entryId: 101, rank: 1, enteredTop20: true });
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Về màn hình đầu" })[0]);
    expect(commandListener.mock.calls.map(([event]) => (event as CustomEvent).detail)).toContainEqual({ type: "menu" });
    window.removeEventListener("skydash:command", commandListener);
  });

  it("mô phỏng game-over đến Top 20 với hai lượt trùng tên, lời khen đúng hạng và tô đúng lượt vừa lưu", async () => {
    window.localStorage.setItem("hanaSkyDashPlayerName", "Long");
    const { container } = render(<SkyDashHud />);

    act(() => {
      window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: { ...gameoverSnapshot, score: 420, distance: 68 } }));
    });
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledTimes(1));

    await act(async () => {
      await mocks.mutationOptions.onSuccess({
        seasonKey: "2026-08-22",
        entryId: 202,
        rank: 2,
        enteredTop20: true,
        rows: [
          { id: 201, rank: 1, playerName: "Long", runnerId: "cinnamoroll", score: 480, stars: 0, distance: 75, submittedAt: 1 },
          { id: 202, rank: 2, playerName: "Long", runnerId: "kuromi", score: 420, stars: 0, distance: 68, submittedAt: 2 },
        ],
      });
    });

    expect(screen.getAllByText("Long")).toHaveLength(2);
    expect(screen.getByText("Chuyến bay này đang ở hạng #2.")).toBeTruthy();
    expect(container.querySelector(".just-ranked")?.textContent).toContain("Long");
    expect(container.querySelector(".just-ranked")?.textContent).toContain("420");
    expect(screen.getByText("Hạng #2: bạn đang ở bục vinh danh Top 3!")).toBeTruthy();
  });

  it("encourages a low-score run that has not entered Top 20", async () => {
    window.localStorage.setItem("hanaSkyDashPlayerName", "Mây Nhỏ");
    render(<SkyDashHud />);
    act(() => {
      window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: { ...gameoverSnapshot, score: 300, distance: 40 } }));
    });
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledOnce());
    await act(async () => {
      await mocks.mutationOptions.onSuccess({ seasonKey: "2026-08-22", rows: [], entryId: 401, rank: null, enteredTop20: false });
    });
    expect(screen.getByText("Khởi đầu thật đáng yêu!")).toBeTruthy();
    expect(screen.getByText("Chưa vào Top 20 tuần này.")).toBeTruthy();
    expect(screen.getByText(/Cố gắng thêm một chuyến bay/)).toBeTruthy();
  });
});
