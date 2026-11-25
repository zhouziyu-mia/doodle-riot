import { useEffect } from "react";
import { useRoomStore } from "@/store/useRoomStore";
import { AI_DRAW_DONE, AI_DRAW_START, AI_ID, makeAiStrokes, shapeFor } from "@/utils/aiBuddy";
import { pick } from "@/utils/words";

/**
 * 轮到 AI 搭子当画手时（每 5 轮一次），由本机代它照着图纸一笔一笔画出简笔画，
 * 画完再发句话坐等人类来猜。它当然不知道自己画的是啥。
 */
export function useAiPainter(): void {
  const hasAi = useRoomStore((s) => !!s.room?.players.some((p) => p.id === AI_ID));
  const phase = useRoomStore((s) => s.room?.round.phase ?? "waiting");
  const index = useRoomStore((s) => s.room?.round.index ?? 0);
  const drawerId = useRoomStore((s) => s.room?.round.drawerId ?? "");
  const word = useRoomStore((s) => s.room?.round.word ?? "");
  const myId = useRoomStore((s) => s.profile?.playerId ?? "");

  // 本机是真人，而画手是 AI：由本机替 AI 挥笔
  const aiDrawing = hasAi && phase === "drawing" && drawerId === AI_ID && myId !== AI_ID;

  useEffect(() => {
    if (!aiDrawing) return;
    const strokes = makeAiStrokes(shapeFor(word));
    if (strokes.length === 0) return;
    const step = 500 + Math.random() * 400;
    const timers: number[] = [];
    const later = (delay: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, delay));
    };

    later(500, () => useRoomStore.getState().aiBubble(pick(AI_DRAW_START)));
    strokes.forEach((stroke, i) => {
      later(1300 + i * step, () => useRoomStore.getState().commitStroke(stroke));
    });
    later(1300 + strokes.length * step + 800, () =>
      useRoomStore.getState().aiBubble(pick(AI_DRAW_DONE)),
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [aiDrawing, index, word]);
}
