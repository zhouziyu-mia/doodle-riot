import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Lobby from "@/pages/Lobby";
import Room from "@/pages/Room";
import { useRoomStore } from "@/store/useRoomStore";
import { saveProfile, saveRoom } from "@/utils/storage";
import type { Player } from "@/types";

const HOST = { playerId: "host1", name: "画手小王", avatar: "🐤", color: "#FF5A5F" };

const guestPlayer = (): Player => ({
  id: "guest1",
  name: "猜手小李",
  avatar: "🐸",
  color: "#2E9BFF",
  role: "guest",
  isDrawer: false,
  score: 0,
  combo: 0,
  lastSeen: Date.now(),
});

beforeEach(() => {
  useRoomStore.getState().leaveRoom();
  localStorage.clear();
  useRoomStore.setState({ profile: null, room: null, toast: null, pendingGuess: false });
});

afterEach(() => cleanup());

describe("大厅页", () => {
  it("渲染标题与玩法说明", async () => {
    render(
      <MemoryRouter>
        <Lobby />
      </MemoryRouter>,
    );
    expect(await screen.findByText("涂鸦乱猜")).toBeInTheDocument();
    expect(screen.getByText("怎么玩？（超简单）")).toBeInTheDocument();
  });

  it("点击开一张画布后展示房码面板", async () => {
    render(
      <MemoryRouter>
        <Lobby />
      </MemoryRouter>,
    );
    const button = await screen.findByRole("button", { name: /开一张画布/ });
    fireEvent.click(button);
    expect(await screen.findByText("画布开好了！")).toBeInTheDocument();
    expect(useRoomStore.getState().room).not.toBeNull();
  });

  it("输错房码会给出沙雕报错", async () => {
    render(
      <MemoryRouter>
        <Lobby />
      </MemoryRouter>,
    );
    fireEvent.change(await screen.findByLabelText("房间码"), { target: { value: "ZZZZ" } });
    fireEvent.click(screen.getByRole("button", { name: /加入/ }));
    expect(await screen.findByText(/查无此房|房码不对|隔壁老王/)).toBeInTheDocument();
  });
});

describe("游戏房间页", () => {
  it("伙伴未到齐时展示等待面板与房码", async () => {
    useRoomStore.setState({ profile: HOST });
    saveProfile(HOST);
    const code = useRoomStore.getState().createRoom();
    render(
      <MemoryRouter initialEntries={[`/room/${code}`]}>
        <Routes>
          <Route path="/room/:code" element={<Room />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/等待你的搭子/)).toBeInTheDocument();
    expect(screen.getAllByText(code).length).toBeGreaterThan(0);
  });

  it("伙伴到齐后房主可以开始第一轮并进入作画状态", async () => {
    useRoomStore.setState({ profile: HOST });
    saveProfile(HOST);
    const code = useRoomStore.getState().createRoom();
    const base = useRoomStore.getState().room!;
    const withGuest = { ...base, players: [...base.players, guestPlayer()] };
    saveRoom(withGuest);
    useRoomStore.setState({ room: withGuest });

    render(
      <MemoryRouter initialEntries={[`/room/${code}`]}>
        <Routes>
          <Route path="/room/:code" element={<Room />} />
        </Routes>
      </MemoryRouter>,
    );

    const start = await screen.findByRole("button", { name: /开始第一轮/ });
    fireEvent.click(start);
    await waitFor(() => {
      expect(useRoomStore.getState().room!.round.phase).toBe("drawing");
    });
    expect(await screen.findByText(/第 1 轮/)).toBeInTheDocument();
  });

  it("房码不存在时给出兜底提示", async () => {
    useRoomStore.setState({ profile: HOST });
    render(
      <MemoryRouter initialEntries={["/room/NOPE"]}>
        <Routes>
          <Route path="/room/:code" element={<Room />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/没找到这间画布/)).toBeInTheDocument();
  });
});
