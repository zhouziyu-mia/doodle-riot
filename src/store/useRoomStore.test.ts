import { beforeEach, describe, expect, it } from "vitest";
import { isOnline, useRoomStore } from "@/store/useRoomStore";
import { AI_ID } from "@/utils/aiBuddy";
import type { Player, Stroke } from "@/types";

const HOST = { playerId: "host1", name: "画手小王", avatar: "🐤", color: "#FF5A5F" };
const GUEST = { playerId: "guest1", name: "猜手小李", avatar: "🐸", color: "#2E9BFF" };

function reset() {
  useRoomStore.getState().leaveRoom();
  localStorage.clear();
  useRoomStore.setState({ profile: null, room: null, toast: null, pendingGuess: false });
}

function setupTwoPlayers(): string {
  useRoomStore.setState({ profile: HOST });
  const code = useRoomStore.getState().createRoom();
  useRoomStore.setState({ profile: GUEST });
  expect(useRoomStore.getState().joinRoom(code)).toBe(true);
  useRoomStore.setState({ profile: HOST });
  return code;
}

function makeStroke(id: string, playerId: string): Stroke {
  return {
    id,
    playerId,
    color: "#141414",
    size: 8,
    erase: false,
    points: [
      { x: 0.1, y: 0.1 },
      { x: 0.3, y: 0.4 },
    ],
  };
}

beforeEach(reset);

describe("房间生命周期", () => {
  it("创建房间后创建者成为房主", () => {
    useRoomStore.setState({ profile: HOST });
    const code = useRoomStore.getState().createRoom();
    const room = useRoomStore.getState().room!;
    expect(room.code).toBe(code);
    expect(room.players).toHaveLength(1);
    expect(room.players[0].role).toBe("host");
    expect(room.round.phase).toBe("waiting");
  });

  it("第二个人输码加入后房间里有两个玩家", () => {
    useRoomStore.setState({ profile: HOST });
    const code = useRoomStore.getState().createRoom();
    useRoomStore.setState({ profile: GUEST });
    const ok = useRoomStore.getState().joinRoom(code);
    expect(ok).toBe(true);
    const room = useRoomStore.getState().room!;
    expect(room.players).toHaveLength(2);
    const guest = room.players.find((p) => p.id === GUEST.playerId)!;
    expect(guest.role).toBe("guest");
  });

  it("输入不存在的房码无法加入", () => {
    useRoomStore.setState({ profile: GUEST });
    expect(useRoomStore.getState().joinRoom("ZZZZ")).toBe(false);
  });
});

describe("回合与计分", () => {
  it("人不满时不能开始，并给出提示", () => {
    useRoomStore.setState({ profile: HOST });
    useRoomStore.getState().createRoom();
    useRoomStore.getState().startRound();
    expect(useRoomStore.getState().room!.round.phase).toBe("waiting");
    expect(useRoomStore.getState().toast?.text).toContain("还差一位伙伴");
  });

  it("startRound 轮换画手并给出词条", () => {
    setupTwoPlayers();
    useRoomStore.getState().startRound();
    const round = useRoomStore.getState().room!.round;
    expect(round.index).toBe(1);
    expect(round.phase).toBe("drawing");
    expect(round.drawerId).toBe(HOST.playerId);
    expect(round.word.length).toBeGreaterThan(0);
    expect(useRoomStore.getState().room!.players.find((p) => p.id === HOST.playerId)!.isDrawer).toBe(
      true,
    );
  });

  it("猜中后结算加分并翻到 settled", () => {
    setupTwoPlayers();
    useRoomStore.getState().startRound();
    const code = useRoomStore.getState().room!.code;
    const word = useRoomStore.getState().room!.round.word;

    useRoomStore.getState().receive({ type: "guess", code, playerId: GUEST.playerId, text: word });

    const room = useRoomStore.getState().room!;
    expect(room.round.phase).toBe("settled");
    expect(room.round.guessedBy).toBe(GUEST.playerId);
    expect(room.players.find((p) => p.id === GUEST.playerId)!.score).toBeGreaterThanOrEqual(100);
    expect(room.players.find((p) => p.id === GUEST.playerId)!.combo).toBe(1);
  });

  it("猜错只冒出气泡，回合继续", () => {
    setupTwoPlayers();
    useRoomStore.getState().startRound();
    const code = useRoomStore.getState().room!.code;
    const before = useRoomStore.getState().room!.bubbles.length;

    useRoomStore.getState().receive({ type: "guess", code, playerId: GUEST.playerId, text: "肯定不是这个" });

    const room = useRoomStore.getState().room!;
    expect(room.round.phase).toBe("drawing");
    expect(room.bubbles.length).toBe(before + 1);
    expect(room.bubbles[room.bubbles.length - 1].kind).toBe("guess");
  });

  it("超时自动结算且双方不得分", () => {
    setupTwoPlayers();
    useRoomStore.getState().startRound();
    const room = useRoomStore.getState().room!;
    useRoomStore.setState({
      room: {
        ...room,
        round: { ...room.round, startedAt: Date.now() - room.round.durationMs - 50 },
      },
    });
    useRoomStore.getState().checkTimeout();
    const after = useRoomStore.getState().room!;
    expect(after.round.phase).toBe("settled");
    expect(after.players.every((p) => p.score === 0)).toBe(true);
  });

  it("到达目标分后进入 finished", () => {
    setupTwoPlayers();
    useRoomStore.getState().startRound();
    const room = useRoomStore.getState().room!;
    useRoomStore.setState({
      room: {
        ...room,
        players: room.players.map((p) =>
          p.id === GUEST.playerId ? { ...p, score: room.targetScore - 10 } : p,
        ),
      },
    });
    const code = useRoomStore.getState().room!.code;
    const word = useRoomStore.getState().room!.round.word;
    useRoomStore.getState().receive({ type: "guess", code, playerId: GUEST.playerId, text: word });
    expect(useRoomStore.getState().room!.round.phase).toBe("finished");
  });

  it("再来一局会清空分数与笔画", () => {
    setupTwoPlayers();
    useRoomStore.getState().startRound();
    useRoomStore.getState().commitStroke(makeStroke("s1", HOST.playerId));
    expect(useRoomStore.getState().room!.strokes).toHaveLength(1);
    useRoomStore.getState().resetGame();
    const room = useRoomStore.getState().room!;
    expect(room.strokes).toHaveLength(0);
    expect(room.players.every((p) => p.score === 0)).toBe(true);
    expect(room.round.phase).toBe("waiting");
  });
});

describe("画板操作", () => {
  it("只有画手能落笔、撤销与清空", () => {
    setupTwoPlayers();
    useRoomStore.getState().startRound();
    useRoomStore.getState().commitStroke(makeStroke("s1", HOST.playerId));
    useRoomStore.getState().commitStroke(makeStroke("s2", HOST.playerId));
    expect(useRoomStore.getState().room!.strokes).toHaveLength(2);

    useRoomStore.getState().undoMyStroke();
    expect(useRoomStore.getState().room!.strokes.map((s) => s.id)).toEqual(["s1"]);

    useRoomStore.getState().clearCanvas();
    expect(useRoomStore.getState().room!.strokes).toHaveLength(0);
  });

  it("非画手清空无效", () => {
    setupTwoPlayers();
    useRoomStore.getState().startRound();
    useRoomStore.getState().commitStroke(makeStroke("s1", HOST.playerId));
    useRoomStore.setState({ profile: GUEST });
    useRoomStore.getState().clearCanvas();
    expect(useRoomStore.getState().room!.strokes).toHaveLength(1);
  });
});

describe("在线状态", () => {
  it("心跳新鲜算在线，超时算离线", () => {
    const now = Date.now();
    const base: Player = {
      id: "p",
      name: "n",
      avatar: "🐤",
      color: "#000",
      role: "host",
      isDrawer: false,
      score: 0,
      combo: 0,
      lastSeen: now,
    };
    expect(isOnline({ ...base, lastSeen: now - 500 }, now)).toBe(true);
    expect(isOnline({ ...base, lastSeen: now - 9000 }, now)).toBe(false);
  });

  it("heartbeat 会刷新自己的 lastSeen", () => {
    useRoomStore.setState({ profile: HOST });
    useRoomStore.getState().createRoom();
    const room = useRoomStore.getState().room!;
    useRoomStore.setState({
      room: {
        ...room,
        players: room.players.map((p) => ({ ...p, lastSeen: Date.now() - 20_000 })),
      },
    });
    useRoomStore.getState().heartbeat();
    const me = useRoomStore.getState().room!.players[0];
    expect(Date.now() - me.lastSeen).toBeLessThan(1000);
  });
});

describe("假 AI 搭子", () => {
  it("邀请后 AI 以房客身份加入，且被心跳保活", () => {
    useRoomStore.setState({ profile: HOST });
    useRoomStore.getState().createRoom();
    useRoomStore.getState().inviteAi();

    const room = useRoomStore.getState().room!;
    expect(room.players).toHaveLength(2);
    expect(room.players.find((p) => p.id === AI_ID)!.role).toBe("guest");

    useRoomStore.setState({
      room: {
        ...room,
        players: room.players.map((p) => ({ ...p, lastSeen: Date.now() - 20_000 })),
      },
    });
    useRoomStore.getState().heartbeat();
    const ai = useRoomStore.getState().room!.players.find((p) => p.id === AI_ID)!;
    expect(Date.now() - ai.lastSeen).toBeLessThan(1000);
    expect(isOnline(ai, Date.now())).toBe(true);
  });

  it("有 AI 在场时画手固定由真人担任，AI 猜中后正常结算", () => {
    useRoomStore.setState({ profile: HOST });
    useRoomStore.getState().createRoom();
    useRoomStore.getState().inviteAi();
    useRoomStore.getState().startRound();

    const round = useRoomStore.getState().room!.round;
    expect(round.phase).toBe("drawing");
    expect(round.drawerId).toBe(HOST.playerId);

    useRoomStore.getState().finishDrawing();
    useRoomStore.getState().aiGuess(round.word);
    const room = useRoomStore.getState().room!;
    expect(room.round.phase).toBe("settled");
    expect(room.round.guessedBy).toBe(AI_ID);
    expect(room.players.find((p) => p.id === AI_ID)!.score).toBeGreaterThanOrEqual(100);
  });

  it("AI 瞎猜只会留下气泡，不会结算", () => {
    useRoomStore.setState({ profile: HOST });
    useRoomStore.getState().createRoom();
    useRoomStore.getState().inviteAi();
    useRoomStore.getState().startRound();
    useRoomStore.getState().finishDrawing();
    const before = useRoomStore.getState().room!.bubbles.length;

    useRoomStore.getState().aiBubble("图像识别中… 3%");
    useRoomStore.getState().aiGuess("一个怎么看都不对的答案");

    const room = useRoomStore.getState().room!;
    expect(room.round.phase).toBe("drawing");
    expect(room.bubbles.length).toBe(before + 2);
  });

  it("画手没点“我画完了”之前，AI 再怎么样也猜不出来", () => {
    useRoomStore.setState({ profile: HOST });
    useRoomStore.getState().createRoom();
    useRoomStore.getState().inviteAi();
    useRoomStore.getState().startRound();
    const word = useRoomStore.getState().room!.round.word;

    useRoomStore.getState().aiGuess(word);

    const room = useRoomStore.getState().room!;
    expect(room.round.drawerDone).toBeFalsy();
    expect(room.round.phase).toBe("drawing");
    expect(room.round.guessedBy).toBeUndefined();
  });

  it("画手点“我画完了”会打上标记，且只有画手能点", () => {
    useRoomStore.setState({ profile: HOST });
    useRoomStore.getState().createRoom();
    useRoomStore.getState().inviteAi();
    useRoomStore.getState().startRound();

    useRoomStore.getState().finishDrawing();
    expect(useRoomStore.getState().room!.round.drawerDone).toBe(true);

    // 换回第二个人（非画手）再点一次不应该有别的效果
    useRoomStore.setState({ profile: GUEST });
    useRoomStore.getState().finishDrawing();
    expect(useRoomStore.getState().room!.round.drawerDone).toBe(true);
  });

  it("每 5 轮换 AI 搭子当画手，其余轮次还是真人画", () => {
    useRoomStore.setState({ profile: HOST });
    useRoomStore.getState().createRoom();
    useRoomStore.getState().inviteAi();

    const drawerOfRound = (): string => {
      useRoomStore.getState().startRound();
      return useRoomStore.getState().room!.round.drawerId;
    };

    const round1 = drawerOfRound();
    const round2 = drawerOfRound();
    const round3 = drawerOfRound();
    const round4 = drawerOfRound();
    const round5 = drawerOfRound();
    const round6 = drawerOfRound();

    expect([round1, round2, round3, round4]).toEqual([
      HOST.playerId,
      HOST.playerId,
      HOST.playerId,
      HOST.playerId,
    ]);
    expect(round5).toBe(AI_ID);
    expect(round6).toBe(HOST.playerId);
    expect(useRoomStore.getState().room!.round.index).toBe(6);
  });

  it("AI 当画手时，人类猜中由本机直接判定并结算", () => {
    useRoomStore.setState({ profile: HOST });
    useRoomStore.getState().createRoom();
    useRoomStore.getState().inviteAi();
    for (let i = 0; i < 4; i += 1) useRoomStore.getState().startRound();

    useRoomStore.getState().startRound();
    const round = useRoomStore.getState().room!.round;
    expect(round.index).toBe(5);
    expect(round.drawerId).toBe(AI_ID);

    useRoomStore.getState().submitGuess(round.word);
    const room = useRoomStore.getState().room!;
    expect(room.round.phase).toBe("settled");
    expect(room.round.guessedBy).toBe(HOST.playerId);
    expect(room.players.find((p) => p.id === HOST.playerId)!.score).toBeGreaterThanOrEqual(100);
    expect(room.players.find((p) => p.id === AI_ID)!.score).toBe(0);
  });
});
