import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Home, Palette } from "lucide-react";
import { useRoomStore } from "@/store/useRoomStore";
import { useNow } from "@/hooks/useNow";
import { useAiBuddy } from "@/hooks/useAiBuddy";
import { useAiPainter } from "@/hooks/useAiPainter";
import { AI_ID, isAiPlayer } from "@/utils/aiBuddy";
import { RoundBar } from "@/components/room/RoundBar";
import { DoodleCanvas } from "@/components/room/DoodleCanvas";
import { BrushDock } from "@/components/room/BrushDock";
import { GuessBar } from "@/components/room/GuessBar";
import { BubbleStream } from "@/components/room/BubbleStream";
import { SettleOverlay } from "@/components/room/SettleOverlay";
import { WaitingPanel } from "@/components/room/WaitingPanel";
import { ToastLayer } from "@/components/ui/ToastLayer";
import { DecorBackdrop } from "@/components/ui/DecorBackdrop";

export default function Room() {
  const { code = "" } = useParams();

  const profile = useRoomStore((s) => s.profile);
  const room = useRoomStore((s) => s.room);
  const toast = useRoomStore((s) => s.toast);
  const pendingGuess = useRoomStore((s) => s.pendingGuess);

  const init = useRoomStore((s) => s.init);
  const enterRoom = useRoomStore((s) => s.enterRoom);
  const streamStroke = useRoomStore((s) => s.streamStroke);
  const commitStroke = useRoomStore((s) => s.commitStroke);
  const clearCanvas = useRoomStore((s) => s.clearCanvas);
  const undoMyStroke = useRoomStore((s) => s.undoMyStroke);
  const startRound = useRoomStore((s) => s.startRound);
  const advanceRound = useRoomStore((s) => s.advanceRound);
  const checkTimeout = useRoomStore((s) => s.checkTimeout);
  const finishDrawing = useRoomStore((s) => s.finishDrawing);
  const submitGuess = useRoomStore((s) => s.submitGuess);
  const sendBubble = useRoomStore((s) => s.sendBubble);
  const inviteAi = useRoomStore((s) => s.inviteAi);

  const now = useNow(200);
  const [brush, setBrush] = useState({ color: "#141414", size: 8, erase: false });
  const [missing, setMissing] = useState(false);

  useAiBuddy();
  useAiPainter();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!code || !profile) return;
    enterRoom(code.toUpperCase());
    const timer = window.setTimeout(() => {
      if (!useRoomStore.getState().room) setMissing(true);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [code, profile, enterRoom]);

  useEffect(
    () => () => {
      useRoomStore.getState().leaveRoom();
    },
    [],
  );

  const phase = room?.round.phase ?? "waiting";
  const remainingMs =
    phase === "drawing" && room
      ? Math.max(0, room.round.startedAt + room.round.durationMs - now)
      : 0;

  useEffect(() => {
    if (phase !== "drawing") return;
    if (remainingMs > 0) return;
    checkTimeout();
  }, [phase, remainingMs, checkTimeout]);

  if (missing || !profile) {
    return (
      <div className="relative flex min-h-full items-center justify-center p-6">
        <DecorBackdrop />
        <div className="sticker max-w-md p-8 text-center">
          <div className="text-5xl">🙈</div>
          <h1 className="mt-3 font-doodle text-2xl tracking-wide">没找到这间画布</h1>
          <p className="mt-2 text-sm font-bold text-ink/60">
            房码 <span className="font-mono">{code}</span> 不存在或已过期，回去重新开一张吧
          </p>
          <Link to="/" className="btn-primary mt-5">
            <Home className="h-5 w-5" strokeWidth={3} />
            回到大厅
          </Link>
        </div>
      </div>
    );
  }

  if (!room || room.code !== code.toUpperCase()) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <span className="sticker animate-jiggle px-6 py-4 font-doodle text-xl">
          正在铺开画布…
        </span>
      </div>
    );
  }

  const me = room.players.find((p) => p.id === profile.playerId);
  const isDrawer = me?.isDrawer ?? false;
  const isHost = me?.role === "host";
  const canDraw = isDrawer && phase === "drawing";
  const canGuess = !isDrawer && phase === "drawing";

  return (
    <div className="relative min-h-full">
      <DecorBackdrop />
      <ToastLayer toast={toast} />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-4 sm:px-5 sm:py-6">
        <header className="flex items-center justify-between gap-3">
          <Link to="/" className="chip bg-paper hover:bg-lemon-100">
            <Home className="h-4 w-4" strokeWidth={3} />
            大厅
          </Link>
          <span className="chip bg-ink font-mono text-lemon-200">
            <Palette className="h-3.5 w-3.5" strokeWidth={3} />
            房码 {room.code}
          </span>
        </header>

        {room.players.length < 2 ? (
          <WaitingPanel
            code={room.code}
            players={room.players}
            now={now}
            isHost={isHost}
            onStart={startRound}
            onInviteAi={inviteAi}
          />
        ) : (
          <>
            <RoundBar room={room} players={room.players} remainingMs={remainingMs} />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="relative h-[46vh] min-h-[300px] sm:h-[54vh] lg:h-[62vh]">
                <DoodleCanvas
                  strokes={room.strokes}
                  readOnly={!canDraw}
                  brush={brush}
                  authorId={profile.playerId}
                  onStroke={(stroke, final) => (final ? commitStroke(stroke) : streamStroke(stroke))}
                />
                <BubbleStream bubbles={room.bubbles} players={room.players} now={now} />
              </div>

              <div className="flex flex-col gap-4">
                {phase === "waiting" ? (
                  <div className="sticker bg-lemon-grad p-5 text-center">
                    <p className="font-doodle text-xl tracking-wide">准备好了就开画！</p>
                    <p className="mt-1 text-sm font-bold text-ink/60">
                      {isHost ? "你是房主，点下面开始第一轮" : "等房主点击开始"}
                    </p>
                    {isHost && (
                      <button type="button" onClick={startRound} className="btn-primary mt-4 w-full">
                        开始第一轮 →
                      </button>
                    )}
                  </div>
                ) : (
                  <GuessBar
                    isDrawer={isDrawer}
                    word={room.round.word}
                    hint={room.round.hint}
                    canGuess={canGuess}
                    pending={pendingGuess}
                    drawerDone={!!room.round.drawerDone}
                    hasAi={room.players.some((p) => isAiPlayer(p))}
                    drawerIsAi={room.round.drawerId === AI_ID}
                    onGuess={submitGuess}
                    onBubble={sendBubble}
                    onFinish={finishDrawing}
                  />
                )}

                <div className="sticker p-4">
                  <p className="mb-3 text-sm font-bold text-ink/60">
                    {canDraw ? "画笔在你手里，开涂！" : "你只能看着 TA 画（忍一忍）"}
                  </p>
                  <BrushDock
                    color={brush.color}
                    size={brush.size}
                    erase={brush.erase}
                    disabled={!canDraw}
                    onColor={(color) => setBrush((b) => ({ ...b, color }))}
                    onSize={(size) => setBrush((b) => ({ ...b, size }))}
                    onToggleErase={() => setBrush((b) => ({ ...b, erase: !b.erase }))}
                    onUndo={undoMyStroke}
                    onClear={clearCanvas}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <SettleOverlay
        room={room}
        open={phase === "settled" || phase === "finished"}
        onNext={advanceRound}
      />
    </div>
  );
}
