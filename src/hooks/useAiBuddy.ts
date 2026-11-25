import { useEffect } from "react";
import { useRoomStore } from "@/store/useRoomStore";
import {
  AI_CRACKED,
  AI_ID,
  aiAnalysisLine,
  aiObserve,
  aiWrongTimes,
  aiWrongWord,
} from "@/utils/aiBuddy";
import { pick } from "@/utils/words";

/**
 * 驱动“假 AI 搭子”：只有画手点了「我画完了」之后，它才开始看图。
 * 它并不认识答案，只能靠数线条、看轮廓来“推理”：
 * 先点评画面（笔画越多/越少说法不同）→ 顺着分类提示瞎猜几次 → 最后才猜中。
 * 全部靠本地定时器，没有任何真实 AI 调用。
 */
export function useAiBuddy(): void {
  const hasAi = useRoomStore((s) => !!s.room?.players.some((p) => p.id === AI_ID));
  const phase = useRoomStore((s) => s.room?.round.phase ?? "waiting");
  const index = useRoomStore((s) => s.room?.round.index ?? 0);
  const drawerId = useRoomStore((s) => s.room?.round.drawerId ?? "");
  const drawerDone = useRoomStore((s) => s.room?.round.drawerDone ?? false);
  const myId = useRoomStore((s) => s.profile?.playerId ?? "");

  // 只有“本机真人当画手、已点画完、AI 当猜手”时，才由本机来驱动 AI
  const aiTurn = hasAi && phase === "drawing" && drawerDone && drawerId === myId && drawerId !== AI_ID;

  useEffect(() => {
    if (!aiTurn) return;
    const room = useRoomStore.getState().room;
    if (!room) return;
    const answer = room.round.word;
    if (!answer) return;

    // AI 能看到的“情报”只有画笔：数一数有几笔，决定看多久、猜错几次
    const strokeCount = room.strokes.length;
    const wrongTimes = aiWrongTimes(strokeCount);
    const remaining = Math.max(0, room.round.startedAt + room.round.durationMs - Date.now());
    // 每一步（发话 / 猜一次）约 4~5.6 秒，看得见它在磨叽；
    // 但总时长必须塞进剩余时间里（留 2 秒结算缓冲），免得它磨到超时
    const perStep = 4200 + Math.random() * 1400;
    const budget = Math.max(3000, remaining - 2000);
    const pace = perStep * Math.min(1, budget / (perStep * (1.6 + wrongTimes)));
    const timers: number[] = [];
    const later = (delay: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, delay));
    };

    later(pace * 0.6, () => useRoomStore.getState().aiBubble(aiObserve(strokeCount)));
    later(pace * 1.2, () => useRoomStore.getState().aiBubble(aiAnalysisLine(room.round.hint)));
    for (let i = 0; i < wrongTimes; i += 1) {
      later(pace * (1.6 + i), () => useRoomStore.getState().aiGuess(aiWrongWord(answer)));
    }
    later(pace * (1.6 + wrongTimes), () => {
      const store = useRoomStore.getState();
      store.aiBubble(pick(AI_CRACKED));
      store.aiGuess(answer);
    });

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [aiTurn, index]);
}
