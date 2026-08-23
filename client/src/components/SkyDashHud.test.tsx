// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { GameSnapshot } from "@/game/types";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  refetch: vi.fn(),
  setData: vi.fn(),
  createCard: vi.fn(),
  downloadCard: vi.fn(),
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
vi.mock("@/lib/achievementCard", () => ({
  createAchievementCard: mocks.createCard,
  downloadAchievementCard: mocks.downloadCard,
}));

import SkyDashHud from "./SkyDashHud";

const scrollIntoView = vi.fn();
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });

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
  musicEnabled: true,
  effectsEnabled: true,
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
  mocks.createCard.mockReset();
  mocks.downloadCard.mockReset();
  scrollIntoView.mockReset();
  mocks.leaderboardData = { seasonKey: "2026-08-22", rows: [] };
  mocks.mutationOptions = null;
});

describe("SkyDashHud run flow", () => {
  it("sends independent commands for music and effects preferences", () => {
    const commandListener = vi.fn();
    window.addEventListener("skydash:command", commandListener);
    render(<SkyDashHud />);

    fireEvent.click(screen.getByRole("button", { name: "Tắt nhạc nền" }));
    fireEvent.click(screen.getByRole("button", { name: "Tắt hiệu ứng âm thanh" }));

    expect(commandListener).toHaveBeenCalledWith(expect.objectContaining({ detail: { type: "setMusic", enabled: false } }));
    expect(commandListener).toHaveBeenCalledWith(expect.objectContaining({ detail: { type: "setEffects", enabled: false } }));
    window.removeEventListener("skydash:command", commandListener);
  });

  it("mirrors menu audio state before Babylon is ready", () => {
    render(<SkyDashHud />);

    act(() => {
      window.dispatchEvent(new CustomEvent("skydash:audio-state", { detail: { musicEnabled: false, effectsEnabled: false, message: "Nhạc nền đã tắt." } }));
    });

    expect(screen.getByRole("button", { name: "Bật nhạc nền" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Bật hiệu ứng âm thanh" })).toBeTruthy();
  });

  it("signals a genuine menu interaction before opening character setup", () => {
    const menuAudioListener = vi.fn();
    window.addEventListener("skydash:menu-interact", menuAudioListener);
    render(<SkyDashHud />);

    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu hành trình" }));

    expect(menuAudioListener).toHaveBeenCalledOnce();
    window.removeEventListener("skydash:menu-interact", menuAudioListener);
  });

  it("retries menu music from the first touch on a menu surface", () => {
    const menuAudioListener = vi.fn();
    window.addEventListener("skydash:menu-interact", menuAudioListener);
    const { container } = render(<SkyDashHud />);

    fireEvent.pointerDown(container.querySelector(".sky-ui")!);

    expect(menuAudioListener).toHaveBeenCalledOnce();
    window.removeEventListener("skydash:menu-interact", menuAudioListener);
  });

  it("requires a name and an explicit character choice before sending Start", () => {
    const commandListener = vi.fn();
    const prepareListener = vi.fn();
    window.addEventListener("skydash:command", commandListener);
    window.addEventListener("skydash:prepare", prepareListener);
    render(<SkyDashHud />);

    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu hành trình" }));
    const runButton = screen.getByRole("button", { name: "Chạy cùng Cinnamoroll" });
    expect((runButton as HTMLButtonElement).disabled).toBe(true);
    expect(document.querySelectorAll(".setup-selected .runner-perks span")).toHaveLength(3);
    expect(screen.getByRole("img", { name: "Mô hình 3D Cinnamoroll đang dùng khi chạy. Kéo để xoay." })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Xoay Cinnamoroll thêm 90 độ" })).toBeTruthy();
    expect(screen.getByText("Preview 360°: mặt trước · gameplay: nhìn lưng khi chạy")).toBeTruthy();
    expect(screen.getByLabelText("Ảnh mặt trước Cinnamoroll")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Chọn Cinnamoroll; ảnh mặt trước" })).toBeTruthy();

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
    expect(prepareListener).toHaveBeenCalledOnce();
    window.removeEventListener("skydash:command", commandListener);
    window.removeEventListener("skydash:prepare", prepareListener);
  });

  it("keeps a mascot recognisable when its portrait image fails to load", () => {
    const { container } = render(<SkyDashHud />);
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu hành trình" }));
    const portraitImage = container.querySelector(".character-grid .character-portrait img");
    expect(portraitImage).toBeTruthy();
    fireEvent.error(portraitImage!);
    expect(portraitImage?.parentElement?.classList.contains("fallback")).toBe(true);
    expect(portraitImage?.parentElement?.textContent).toContain("☁");
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

  it("mô phỏng game-over đến hạng 17, tự cuộn tới dòng vừa lưu và tô đúng lượt", async () => {
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
        rank: 17,
        enteredTop20: true,
        rows: Array.from({ length: 20 }, (_, index) => {
          const rank = index + 1;
          return { id: rank === 17 ? 202 : 300 + rank, rank, playerName: rank === 17 ? "Long" : `Mây ${rank}`, runnerId: rank === 17 ? "kuromi" : "cinnamoroll", score: rank === 17 ? 420 : 1_000 - rank * 10, stars: 0, distance: rank === 17 ? 68 : 100 - rank, submittedAt: rank };
        }),
      });
    });

    expect(screen.getAllByText("Long")).toHaveLength(1);
    expect(screen.getAllByText("Hạng #17: bạn đã chinh phục Top 20 tuần này!")).toHaveLength(1);
    expect(container.querySelector(".just-ranked")?.textContent).toContain("Long");
    expect(container.querySelector(".just-ranked")?.textContent).toContain("420");
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center", inline: "nearest" }));
    expect(screen.getByText("Hạng #17: bạn đã chinh phục Top 20 tuần này!")).toBeTruthy();
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

  it("shares a completed result through the native share sheet", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    render(<SkyDashHud />);
    act(() => {
      window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: { ...gameoverSnapshot, score: 880, distance: 96 } }));
    });
    fireEvent.click(screen.getByRole("button", { name: "Chia sẻ kết quả" }));
    await waitFor(() => expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: "Chạy Đua Cùng Hana", text: expect.stringContaining("880 điểm") })));
    await waitFor(() => expect(screen.getByRole("button", { name: "Đã mở chia sẻ" })).toBeTruthy());
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
  });

  it("copies the result text when native sharing is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<SkyDashHud />);
    act(() => {
      window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: { ...gameoverSnapshot, score: 740, distance: 81 } }));
    });
    fireEvent.click(screen.getByRole("button", { name: "Chia sẻ kết quả" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining("740 điểm")));
    await waitFor(() => expect(screen.getByRole("button", { name: "Đã sao chép lời khoe" })).toBeTruthy());
  });

  it("downloads an achievement PNG with the completed run data", async () => {
    const blob = new Blob(["card"], { type: "image/png" });
    mocks.createCard.mockResolvedValue({ blob, filename: "thanh-tich.png" });
    render(<SkyDashHud />);
    act(() => {
      window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: { ...gameoverSnapshot, score: 1_760, distance: 214, difficultyLevel: 3 } }));
    });
    fireEvent.click(screen.getByRole("button", { name: "Tải thẻ PNG" }));
    await waitFor(() => expect(mocks.createCard).toHaveBeenCalledWith(expect.objectContaining({ score: 1_760, distance: 214, level: 3 })));
    await waitFor(() => expect(mocks.downloadCard).toHaveBeenCalledWith(blob, "thanh-tich.png"));
    expect(screen.getByRole("button", { name: "Đã tải thẻ PNG" })).toBeTruthy();
  });

  it("shares the achievement PNG when file sharing is supported", async () => {
    const blob = new Blob(["card"], { type: "image/png" });
    const share = vi.fn().mockResolvedValue(undefined);
    mocks.createCard.mockResolvedValue({ blob, filename: "thanh-tich.png" });
    Object.defineProperty(navigator, "canShare", { configurable: true, value: vi.fn().mockReturnValue(true) });
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    render(<SkyDashHud />);
    act(() => {
      window.dispatchEvent(new CustomEvent<GameSnapshot>("skydash:state", { detail: { ...gameoverSnapshot, score: 1_120 } }));
    });
    fireEvent.click(screen.getByRole("button", { name: "Chia sẻ thẻ" }));
    await waitFor(() => expect(share).toHaveBeenCalledWith(expect.objectContaining({ files: expect.any(Array) })));
    await waitFor(() => expect(screen.getByRole("button", { name: "Đã mở chia sẻ thẻ" })).toBeTruthy());
    Object.defineProperty(navigator, "canShare", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
  });
});
