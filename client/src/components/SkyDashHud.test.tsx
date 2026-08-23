// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { GameSnapshot } from "@/game/types";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  refetch: vi.fn(),
  setData: vi.fn(),
  mutationOptions: null as any,
}));

vi.mock("@/lib/assets", () => ({ assetUrl: (filename: string) => filename }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    leaderboard: {
      top30: { useQuery: () => ({ data: { seasonKey: "2026-08-22", rows: [] }, refetch: mocks.refetch }) },
      submit: { useMutation: (options: any) => { mocks.mutationOptions = options; return { mutate: mocks.mutate, isPending: false }; } },
    },
    useUtils: () => ({ leaderboard: { top30: { setData: mocks.setData } } }),
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
  mocks.mutationOptions = null;
});

describe("SkyDashHud run flow", () => {
  it("sends Start even when the player has not named a leaderboard entry", () => {
    const commandListener = vi.fn();
    window.addEventListener("skydash:command", commandListener);
    render(<SkyDashHud />);

    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu hành trình" }));
    fireEvent.click(screen.getByRole("button", { name: "Chạy cùng Cinnamoroll" }));

    expect(commandListener).toHaveBeenCalledOnce();
    expect((commandListener.mock.calls[0][0] as CustomEvent).detail).toEqual({ type: "start", characterId: "cinnamoroll" });
    window.removeEventListener("skydash:command", commandListener);
  });

  it("shows the leaderboard name form after a nameless game-over instead of blocking the run", () => {
    render(<SkyDashHud />);

    act(() => {
      window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: gameoverSnapshot }));
    });

    expect(screen.getByText("Đặt tên để ghi hạng nhé.")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "TÊN HIỂN THỊ TRÊN TOP 30" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Lưu & xem hạng" })).toBeTruthy();
  });

  it("renders all 30 ranked slots even when only a few players have submitted scores", () => {
    render(<SkyDashHud />);

    fireEvent.click(screen.getByRole("button", { name: "Xem Top 30" }));

    expect(screen.getByRole("list", { name: "30 hạng của tuần" })).toBeTruthy();
    expect(screen.getAllByText("Đang chờ chuyến bay")).toHaveLength(30);
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
      await mocks.mutationOptions.onSuccess({ seasonKey: "2026-08-22", rows: [], entryId: 101, rank: 1, enteredTop30: true });
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Về màn hình đầu" })[0]);
    expect(commandListener.mock.calls.map(([event]) => (event as CustomEvent).detail)).toContainEqual({ type: "menu" });
    window.removeEventListener("skydash:command", commandListener);
  });
});
