import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper, Timer, Trophy } from "lucide-react";
import { secondsText } from "@/utils/format";
import { pick, titleFor, WIN_REMARKS, WRONG_REMARKS } from "@/utils/words";
import { Avatar } from "@/components/ui/Avatar";
import type { RoomState } from "@/types";

interface SettleOverlayProps {
  room: RoomState;
  open: boolean;
  onNext: () => void;
}

/** 结算弹层：猜中/超时的夸张反馈 */
export function SettleOverlay({ room, open, onNext }: SettleOverlayProps) {
  const winner = room.players.find((p) => p.id === room.round.guessedBy);
  const used = room.round.guessedAt ? room.round.guessedAt - room.round.startedAt : room.round.durationMs;
  const finished = room.round.phase === "finished";
  const champion = [...room.players].sort((a, b) => b.score - a.score)[0];
  const remark = winner ? pick(WIN_REMARKS) : pick(WRONG_REMARKS);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.6, rotate: 6, y: 30 }}
            animate={{ scale: 1, rotate: -1.5, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
            className="sticker w-full max-w-lg bg-lemon-grad p-6 text-center sm:p-8"
          >
            <div className="mb-2 text-5xl">{finished ? "🏆" : winner ? "💥" : "⏰"}</div>

            <h2 className="font-doodle text-3xl tracking-wide sm:text-4xl">
              {finished ? "本局结束！" : winner ? "猜中啦！" : "时间到！"}
            </h2>

            <p className="mt-2 font-bold text-ink/70">
              {winner ? (
                <>
                  <span className="text-tomato">{winner.name}</span> 猜中了「
                  <span className="font-doodle text-lg">{room.round.word}</span>」
                </>
              ) : (
                <>
                  答案其实是「<span className="font-doodle text-lg">{room.round.word}</span>」
                </>
              )}
            </p>

            <p className="mt-1 text-sm font-bold text-ink/50">{remark}</p>

            <div className="mt-5 flex items-center justify-center gap-4">
              <span className="chip bg-paper">
                <Timer className="h-3.5 w-3.5" strokeWidth={3} />
                用时 {secondsText(used)}
              </span>
              {winner && (
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 240 }}
                  className="chip bg-tomato text-white"
                >
                  <PartyPopper className="h-3.5 w-3.5" strokeWidth={3} />
                  +{room.round.gain ?? 0} 分
                </motion.span>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {room.players.map((player) => (
                <div key={player.id} className="sticker-sm flex items-center gap-2.5 p-3">
                  <Avatar player={player} size={38} />
                  <div className="text-left">
                    <p className="max-w-[90px] truncate text-xs font-bold text-ink/60">
                      {player.name}
                    </p>
                    <p className="font-mono text-xl font-black leading-none">{player.score}</p>
                  </div>
                </div>
              ))}
            </div>

            {finished && champion && (
              <p className="mt-4 flex items-center justify-center gap-2 font-bold">
                <Trophy className="h-5 w-5 text-tomato" strokeWidth={3} />
                {champion.name} 荣膺「{titleFor(champion.score)}」
              </p>
            )}

            <button type="button" onClick={onNext} className="btn-primary mt-6 w-full">
              {finished ? "再来一局 🔁" : "下一轮，换人画 →"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
