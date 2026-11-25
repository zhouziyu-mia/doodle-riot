/** 玩家在房间里的身份 */
export type Role = "host" | "guest";

/** 房间内的一位玩家 */
export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  role: Role;
  isDrawer: boolean;
  score: number;
  combo: number;
  lastSeen: number;
}

export interface StrokePoint {
  x: number;
  y: number;
}

/** 一次笔画（画板同步的最小单位），坐标为 0~1 归一化值 */
export interface Stroke {
  id: string;
  playerId: string;
  color: string;
  size: number;
  erase: boolean;
  points: StrokePoint[];
}

/** 回合阶段 */
export type RoundPhase = "waiting" | "drawing" | "settled" | "finished";

/** 回合状态 */
export interface RoundState {
  index: number;
  phase: RoundPhase;
  word: string;
  hint: string;
  drawerId: string;
  startedAt: number;
  durationMs: number;
  /** 画手是否已点击“我画完了”（AI 搭子要等这个信号才开始看图猜） */
  drawerDone?: boolean;
  guessedAt?: number;
  guessedBy?: string;
  gain?: number;
}

/** 吐槽气泡 */
export interface ChatBubble {
  id: string;
  playerId: string;
  text: string;
  kind: "chat" | "guess" | "system";
  at: number;
}

/** 房间整快照（localStorage 持久化的真相来源） */
export interface RoomState {
  code: string;
  createdAt: number;
  updatedAt: number;
  players: Player[];
  strokes: Stroke[];
  round: RoundState;
  bubbles: ChatBubble[];
  targetScore: number;
}

/** 本机档案 */
export interface Profile {
  playerId: string;
  name: string;
  avatar: string;
  color: string;
}

/** 标签页之间广播的消息 */
export type BusMessage =
  | { type: "hello"; code: string; player: Player }
  | { type: "sync"; room: RoomState }
  | { type: "stroke"; code: string; stroke: Stroke }
  | { type: "clear"; code: string; playerId: string }
  | { type: "undo"; code: string; playerId: string; strokeId: string }
  | { type: "guess"; code: string; playerId: string; text: string }
  | { type: "bubble"; code: string; bubble: ChatBubble }
  | { type: "presence"; code: string; player: Player }
  | { type: "round"; code: string; round: RoundState }
  | { type: "settle"; code: string; round: RoundState; playerId?: string; gain?: number; score?: number; combo?: number }
  | { type: "leave"; code: string; playerId: string };

/** 本机瞬时提示（不入库） */
export interface Toast {
  id: string;
  text: string;
  tone: "good" | "bad" | "info";
}
