import { create } from "zustand";
import { openBus, type Bus } from "@/utils/collabBus";
import { computeScore, isCorrect, ROUND_MS } from "@/utils/scoring";
import { drawWord, pick, PLAYER_COLORS, AVATARS, WRONG_REMARKS } from "@/utils/words";
import { AI_DRAW_EVERY, AI_ID, AI_WRONG_REMARKS, makeAiPlayer } from "@/utils/aiBuddy";
import {
  loadProfile,
  loadRoom,
  makeId,
  makePlayer,
  makeRoom,
  makeRoomCode,
  saveProfile,
  saveRoom,
  touch,
} from "@/utils/storage";
import type { BusMessage, ChatBubble, Player, Profile, RoomState, RoundState, Stroke, Toast } from "@/types";

/** 超过该时长未收到心跳即视为离线 */
export const OFFLINE_MS = 6500;

/** 判断玩家是否在线 */
export function isOnline(player: Player, now: number): boolean {
  return now - player.lastSeen < OFFLINE_MS;
}

let bus: Bus | null = null;
let heartbeatTimer: number | null = null;

interface RoomStore {
  profile: Profile | null;
  room: RoomState | null;
  toast: Toast | null;
  pendingGuess: boolean;

  init: () => void;
  rename: (name: string) => void;
  setAvatar: (avatar: string) => void;

  createRoom: () => string;
  joinRoom: (code: string) => boolean;
  enterRoom: (code: string) => void;
  leaveRoom: () => void;

  receive: (msg: BusMessage) => void;
  heartbeat: () => void;

  streamStroke: (stroke: Stroke) => void;
  commitStroke: (stroke: Stroke) => void;
  clearCanvas: () => void;
  undoMyStroke: () => void;

  startRound: () => void;
  advanceRound: () => void;
  checkTimeout: () => void;
  resetGame: () => void;
  /** 画手宣布“我画完了”，AI 搭子这才开始看图猜词 */
  finishDrawing: () => void;

  submitGuess: (text: string) => void;
  sendBubble: (text: string) => void;

  /** 邀请本地“假 AI 搭子”入座 */
  inviteAi: () => void;
  /** 让 AI 搭子发一条吐槽气泡 */
  aiBubble: (text: string) => void;
  /** 让 AI 搭子提交一次猜测（仅画手端生效） */
  aiGuess: (text: string) => void;

  showToast: (text: string, tone?: Toast["tone"]) => void;
  dismissToast: () => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  profile: null,
  room: null,
  toast: null,
  pendingGuess: false,

  init() {
    let profile = loadProfile();
    if (!profile) {
      profile = {
        playerId: makeId("me"),
        name: pick(["画痴本痴", "灵魂画手", "抽象大师", "只会画火柴人"]),
        avatar: pick(AVATARS),
        color: pick(PLAYER_COLORS),
      };
      saveProfile(profile);
    }
    set({ profile });
  },

  rename(name) {
    const { profile } = get();
    if (!profile) return;
    const next = { ...profile, name: name.trim().slice(0, 12) || profile.name };
    saveProfile(next);
    set({ profile: next });
  },

  setAvatar(avatar) {
    const { profile } = get();
    if (!profile) return;
    const next = { ...profile, avatar };
    saveProfile(next);
    set({ profile: next });
  },

  createRoom() {
    const { profile } = get();
    if (!profile) return "";
    let code = makeRoomCode();
    let guard = 0;
    while (loadRoom(code) && guard < 10) {
      code = makeRoomCode();
      guard += 1;
    }
    const host = makePlayer(profile, "host", false);
    const room = makeRoom(code, host);
    saveRoom(room);
    set({ room });
    return code;
  },

  joinRoom(code) {
    const { profile } = get();
    if (!profile) return false;
    const normalized = code.trim().toUpperCase();
    const room = loadRoom(normalized);
    if (!room) return false;
    const player = ensurePlayer(room, profile);
    const next = touch({ ...room, players: player.players });
    set({ room: next });
    return true;
  },

  enterRoom(code) {
    const { profile } = get();
    if (!profile) return;
    const loaded = loadRoom(code);
    if (!loaded) return;
    const ensured = ensurePlayer(loaded, profile);
    const next = syncDrawerFlags({ ...loaded, players: ensured.players });
    saveRoom(next);
    set({ room: next });

    bus?.close();
    bus = openBus(code, (msg) => get().receive(msg));
    const meNow = next.players.find((p) => p.id === profile.playerId);
    if (meNow) bus.post({ type: "hello", code, player: meNow });

    if (heartbeatTimer) window.clearInterval(heartbeatTimer);
    heartbeatTimer = window.setInterval(() => get().heartbeat(), 2000);
  },

  leaveRoom() {
    const { room, profile } = get();
    if (room && profile) {
      bus?.post({ type: "leave", code: room.code, playerId: profile.playerId });
    }
    bus?.close();
    bus = null;
    if (heartbeatTimer) {
      window.clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    set({ room: null, pendingGuess: false });
  },

  heartbeat() {
    const { room, profile } = get();
    if (!room || !profile) return;
    const me = room.players.find((p) => p.id === profile.playerId);
    if (!me) return;
    const now = Date.now();
    const fresh: Player = { ...me, lastSeen: now };
    const players = room.players.map((p) => {
      if (p.id === fresh.id) return fresh;
      if (p.id === AI_ID) return { ...p, lastSeen: now };
      return p;
    });
    const next = { ...room, players };
    saveRoom(next);
    set({ room: next });
    bus?.post({ type: "presence", code: room.code, player: fresh });
  },

  receive(msg) {
    const { room, profile } = get();
    if (!profile) return;
    if (msg.type === "hello") {
      if (!room || room.code !== msg.code) return;
      const players = ensurePlayer(room, profile, msg.player).players;
      const next = touch({ ...room, players });
      saveRoom(next);
      set({ room: next });
      bus?.post({ type: "sync", room: next });
      return;
    }
    if ("code" in msg && msg.code !== (room?.code ?? "")) return;

    switch (msg.type) {
      case "sync": {
        const ensured = ensurePlayer(msg.room, profile);
        const fixed = syncDrawerFlags({ ...msg.room, players: ensured.players });
        saveRoom(fixed);
        set({ room: fixed });
        break;
      }
      case "presence": {
        if (!room) return;
        const players = applyPresence(room.players, msg.player);
        const next = { ...room, players };
        saveRoom(next);
        set({ room: next });
        break;
      }
      case "stroke": {
        if (!room) return;
        set({ room: upsertStroke(room, msg.stroke) });
        break;
      }
      case "clear": {
        if (!room) return;
        const next = touch({ ...room, strokes: [] });
        set({ room: next });
        break;
      }
      case "undo": {
        if (!room) return;
        const strokes = room.strokes.filter((s) => s.id !== msg.strokeId);
        const next = touch({ ...room, strokes });
        set({ room: next });
        break;
      }
      case "bubble": {
        if (!room) return;
        const next = touch({ ...room, bubbles: pushBubble(room.bubbles, msg.bubble) });
        set({ room: next });
        break;
      }
      case "round": {
        if (!room) return;
        const next = touch({
          ...room,
          round: msg.round,
          strokes: [],
        });
        set({ room: syncDrawerFlags(next), pendingGuess: false });
        break;
      }
      case "settle": {
        if (!room) return;
        if (msg.round.index < room.round.index) return;
        const next = applySettle(
          { ...room, round: msg.round },
          msg.playerId,
          msg.score,
          msg.combo,
        );
        saveRoom(next);
        set({ room: next, pendingGuess: false });
        break;
      }
      case "guess": {
        // 只有画手端负责判定
        if (!room || room.round.phase !== "drawing") return;
        if (room.round.drawerId !== profile.playerId) return;
        evaluateGuess(msg.playerId, msg.text, set, get);
        break;
      }
      case "leave": {
        if (!room) return;
        const players = room.players.filter((p) => p.id !== msg.playerId);
        const next = touch({ ...room, players });
        set({ room: next });
        break;
      }
      default:
        break;
    }
  },

  streamStroke(stroke) {
    const { room } = get();
    if (!room) return;
    set({ room: upsertStroke(room, stroke) });
    bus?.post({ type: "stroke", code: room.code, stroke });
  },

  commitStroke(stroke) {
    const { room } = get();
    if (!room) return;
    const next = touch(upsertStroke(room, stroke));
    set({ room: next });
    bus?.post({ type: "stroke", code: room.code, stroke });
  },

  clearCanvas() {
    const { room, profile } = get();
    if (!room || !profile) return;
    if (room.round.drawerId !== profile.playerId) return;
    const next = touch({ ...room, strokes: [] });
    set({ room: next });
    bus?.post({ type: "clear", code: room.code, playerId: profile.playerId });
  },

  undoMyStroke() {
    const { room, profile } = get();
    if (!room || !profile) return;
    if (room.round.drawerId !== profile.playerId) return;
    const mine = [...room.strokes].reverse().find((s) => s.playerId === profile.playerId);
    if (!mine) return;
    const next = touch({ ...room, strokes: room.strokes.filter((s) => s.id !== mine.id) });
    set({ room: next });
    bus?.post({ type: "undo", code: room.code, playerId: profile.playerId, strokeId: mine.id });
  },

  startRound() {
    const { room } = get();
    if (!room) return;
    if (room.players.length < 2) {
      get().showToast("还差一位伙伴，把房间码发给 TA 吧", "info");
      return;
    }
    const nextIndex = room.round.index + 1;
    // AI 搭子每 5 轮画一次（第 5、10、15… 轮），其余轮次由人类当画手
    const aiPlayer = room.players.find((p) => p.id === AI_ID);
    const aiDraws = !!aiPlayer && nextIndex % AI_DRAW_EVERY === 0;
    const humans = room.players.filter((p) => p.id !== AI_ID);
    const humanPool = humans.length > 0 ? humans : room.players;
    // 扣掉已经过去的 AI 轮，人类画手之间保持顺序轮换
    const humanRoundNo = nextIndex - (aiPlayer ? Math.floor(nextIndex / AI_DRAW_EVERY) : 0);
    const drawer = aiDraws ? aiPlayer! : humanPool[(humanRoundNo - 1) % humanPool.length];
    const word = drawWord(room.round.word);
    const round: RoundState = {
      index: nextIndex,
      phase: "drawing",
      word: word.text,
      hint: word.hint,
      drawerId: drawer.id,
      startedAt: Date.now(),
      durationMs: ROUND_MS,
    };
    const next = touch({ ...room, round, strokes: [] });
    set({ room: syncDrawerFlags(next), pendingGuess: false });
    bus?.post({ type: "round", code: room.code, round });
  },

  advanceRound() {
    const { room } = get();
    if (!room) return;
    if (room.round.phase === "finished") {
      get().resetGame();
      return;
    }
    if (room.round.phase !== "settled") return;
    get().startRound();
  },

  finishDrawing() {
    const { room, profile } = get();
    if (!room || !profile) return;
    if (room.round.phase !== "drawing") return;
    if (room.round.drawerId !== profile.playerId) return;
    if (room.round.drawerDone) return;
    const round: RoundState = { ...room.round, drawerDone: true };
    const next = touch({ ...room, round });
    set({ room: next });
    bus?.post({ type: "sync", room: next });
  },

  checkTimeout() {
    const { room } = get();
    if (!room) return;
    const r = room.round;
    if (r.phase !== "drawing") return;
    if (Date.now() < r.startedAt + r.durationMs) return;
    const round: RoundState = { ...r, phase: "settled", gain: 0 };
    const next = applySettle({ ...room, round });
    saveRoom(next);
    set({ room: next });
    bus?.post({ type: "settle", code: room.code, round });
  },

  resetGame() {
    const { room } = get();
    if (!room) return;
    const players = room.players.map((p) => ({ ...p, score: 0, combo: 0, isDrawer: false }));
    const next = touch({
      ...room,
      players,
      strokes: [],
      bubbles: [],
      round: {
        index: 0,
        phase: "waiting",
        word: "",
        hint: "",
        drawerId: players[0]?.id ?? "",
        startedAt: 0,
        durationMs: ROUND_MS,
      },
    });
    saveRoom(next);
    set({ room: next });
    bus?.post({ type: "sync", room: next });
  },

  submitGuess(text) {
    const { room, profile } = get();
    if (!room || !profile) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    if (room.round.phase !== "drawing") return;
    if (room.round.drawerId === profile.playerId) {
      get().showToast("你是画手，别自问自答啦 😅", "info");
      return;
    }
    set({ pendingGuess: true });
    // AI 搭子当画手时，它就住在本机，直接由本机判定，不用绕广播
    if (room.round.drawerId === AI_ID && room.players.some((p) => p.id === AI_ID)) {
      evaluateGuess(profile.playerId, trimmed, set, get);
      window.setTimeout(() => set({ pendingGuess: false }), 1500);
      return;
    }
    bus?.post({ type: "guess", code: room.code, playerId: profile.playerId, text: trimmed });
    window.setTimeout(() => set({ pendingGuess: false }), 1500);
  },

  sendBubble(text) {
    const { room, profile } = get();
    if (!room || !profile) return;
    const bubble: ChatBubble = {
      id: makeId("b"),
      playerId: profile.playerId,
      text,
      kind: "chat",
      at: Date.now(),
    };
    const next = touch({ ...room, bubbles: pushBubble(room.bubbles, bubble) });
    set({ room: next });
    bus?.post({ type: "bubble", code: room.code, bubble });
  },

  inviteAi() {
    const { room } = get();
    if (!room) return;
    if (room.players.some((p) => p.id === AI_ID)) return;
    const next = syncDrawerFlags(touch({ ...room, players: [...room.players, makeAiPlayer()] }));
    set({ room: next });
    bus?.post({ type: "sync", room: next });
    get().showToast("AI 搭子悄悄上线了 🤖", "good");
  },

  aiBubble(text) {
    const { room } = get();
    if (!room) return;
    if (!room.players.some((p) => p.id === AI_ID)) return;
    const bubble: ChatBubble = {
      id: makeId("b"),
      playerId: AI_ID,
      text,
      kind: "chat",
      at: Date.now(),
    };
    const next = touch({ ...room, bubbles: pushBubble(room.bubbles, bubble) });
    set({ room: next });
    bus?.post({ type: "bubble", code: room.code, bubble });
  },

  aiGuess(text) {
    const { room, profile } = get();
    if (!room || !profile) return;
    if (room.round.phase !== "drawing") return;
    if (!room.round.drawerDone) return;
    if (room.round.drawerId !== profile.playerId) return;
    if (!room.players.some((p) => p.id === AI_ID)) return;
    evaluateGuess(AI_ID, text.trim(), set, get);
  },

  showToast(text, tone = "info") {
    set({ toast: { id: makeId("t"), text, tone } });
    window.setTimeout(() => {
      const current = get().toast;
      if (current && current.text === text) set({ toast: null });
    }, 2200);
  },

  dismissToast() {
    set({ toast: null });
  },
}));

/* ------------------------------ 纯函数辅助 ------------------------------ */

function ensurePlayer(room: RoomState, profile: Profile, extra?: Player): { players: Player[] } {
  const players = [...room.players];
  const add = (p: Player) => {
    if (!players.some((x) => x.id === p.id)) players.push(p);
  };
  if (extra) add(extra);
  if (!players.some((p) => p.id === profile.playerId)) {
    const role: Player["role"] = players.some((p) => p.role === "host") ? "guest" : "host";
    add(makePlayer(profile, role, false));
  }
  return { players };
}

function applyPresence(players: Player[], incoming: Player): Player[] {
  const idx = players.findIndex((p) => p.id === incoming.id);
  if (idx === -1) return [...players, incoming];
  const prev = players[idx];
  const merged: Player = {
    ...prev,
    name: incoming.name,
    avatar: incoming.avatar,
    color: incoming.color,
    lastSeen: incoming.lastSeen,
  };
  const next = [...players];
  next[idx] = merged;
  return next;
}

function syncDrawerFlags(room: RoomState): RoomState {
  const drawerId = room.round.drawerId;
  return {
    ...room,
    players: room.players.map((p) => ({ ...p, isDrawer: p.id === drawerId })),
  };
}

function upsertStroke(room: RoomState, stroke: Stroke): RoomState {
  const idx = room.strokes.findIndex((s) => s.id === stroke.id);
  const strokes = [...room.strokes];
  if (idx === -1) strokes.push(stroke);
  else strokes[idx] = stroke;
  return { ...room, strokes };
}

function pushBubble(bubbles: ChatBubble[], bubble: ChatBubble): ChatBubble[] {
  return [...bubbles, bubble].slice(-40);
}

function applySettle(
  room: RoomState,
  winnerId?: string,
  winnerScore?: number,
  winnerCombo?: number,
): RoomState {
  const players = room.players.map((p) => {
    if (winnerId && p.id === winnerId) {
      return { ...p, score: winnerScore ?? p.score, combo: winnerCombo ?? p.combo + 1 };
    }
    return { ...p, combo: winnerId ? 0 : p.combo };
  });
  const finished = players.some((p) => p.score >= room.targetScore);
  const round: RoundState = finished ? { ...room.round, phase: "finished" } : room.round;
  return { ...room, players, round };
}

/** 画手端判定一次猜测 */
function evaluateGuess(
  playerId: string,
  text: string,
  set: (partial: Partial<RoomStore>) => void,
  get: () => RoomStore,
): void {
  const state = get();
  const room = state.room;
  if (!room) return;
  const guesser = room.players.find((p) => p.id === playerId);
  const bubble: ChatBubble = {
    id: makeId("g"),
    playerId,
    text,
    kind: "guess",
    at: Date.now(),
  };

  if (isCorrect(text, room.round.word)) {
    const remaining = room.round.startedAt + room.round.durationMs - Date.now();
    const breakdown = computeScore(remaining, guesser?.combo ?? 0);
    const settledRound: RoundState = {
      ...room.round,
      phase: "settled",
      guessedAt: Date.now(),
      guessedBy: playerId,
      gain: breakdown.total,
    };
    const withBubble = { ...room, round: settledRound, bubbles: pushBubble(room.bubbles, bubble) };
    const settled = applySettle(
      withBubble,
      playerId,
      (guesser?.score ?? 0) + breakdown.total,
      (guesser?.combo ?? 0) + 1,
    );
    const next = touch(settled);
    set({ room: next, pendingGuess: false });
    bus?.post({ type: "bubble", code: room.code, bubble });
    bus?.post({
      type: "settle",
      code: room.code,
      round: next.round,
      playerId,
      score: next.players.find((p) => p.id === playerId)?.score,
      combo: next.players.find((p) => p.id === playerId)?.combo,
    });
    return;
  }

  const next = touch({ ...room, bubbles: pushBubble(room.bubbles, bubble) });
  set({ room: next, pendingGuess: false });
  bus?.post({ type: "bubble", code: room.code, bubble });
  if (playerId === AI_ID) {
    state.showToast(pick(AI_WRONG_REMARKS), "info");
    return;
  }
  state.showToast(pick(WRONG_REMARKS), "bad");
}
