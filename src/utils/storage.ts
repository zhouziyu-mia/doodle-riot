import { ROUND_MS, TARGET_SCORE } from "./scoring";
import type { Player, Profile, RoomState } from "@/types";

const PROFILE_KEY = "doodleriot.profile";
const ROOM_KEY = (code: string) => `doodleriot.room.${code}`;
const ROOM_INDEX_KEY = "doodleriot.rooms";

/** 生成 4 位房间码，剔除易混淆字符 */
export function makeRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function makeId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* 忽略隐私模式等写入失败 */
  }
}

export function loadRoom(code: string): RoomState | null {
  try {
    const raw = localStorage.getItem(ROOM_KEY(code));
    return raw ? (JSON.parse(raw) as RoomState) : null;
  } catch {
    return null;
  }
}

export function saveRoom(room: RoomState): void {
  try {
    localStorage.setItem(ROOM_KEY(room.code), JSON.stringify(room));
    rememberRoomCode(room.code);
  } catch {
    /* ignore */
  }
}

export function rememberRoomCode(code: string): void {
  try {
    const raw = localStorage.getItem(ROOM_INDEX_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(code)) {
      list.unshift(code);
      localStorage.setItem(ROOM_INDEX_KEY, JSON.stringify(list.slice(0, 12)));
    }
  } catch {
    /* ignore */
  }
}

export function forgetRoomCode(code: string): void {
  try {
    const raw = localStorage.getItem(ROOM_INDEX_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(
      ROOM_INDEX_KEY,
      JSON.stringify(list.filter((c) => c !== code)),
    );
  } catch {
    /* ignore */
  }
}

export function makePlayer(
  profile: Profile,
  role: Player["role"],
  isDrawer: boolean,
): Player {
  return {
    id: profile.playerId,
    name: profile.name,
    avatar: profile.avatar,
    color: profile.color,
    role,
    isDrawer,
    score: 0,
    combo: 0,
    lastSeen: Date.now(),
  };
}

export function makeRoom(code: string, host: Player): RoomState {
  const now = Date.now();
  return {
    code,
    createdAt: now,
    updatedAt: now,
    players: [host],
    strokes: [],
    bubbles: [],
    targetScore: TARGET_SCORE,
    round: {
      index: 0,
      phase: "waiting",
      word: "",
      hint: "",
      drawerId: host.id,
      startedAt: 0,
      durationMs: ROUND_MS,
    },
  };
}

/** 重新设置 updatedAt，返回新对象（便于广播） */
export function touch(room: RoomState): RoomState {
  const next = { ...room, updatedAt: Date.now() };
  saveRoom(next);
  return next;
}
