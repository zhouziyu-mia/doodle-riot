import { motion } from "framer-motion";
import { Flame, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { clockTime } from "@/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import type { Player, RoomState } from "@/types";

interface RoundBarProps {
  room: RoomState;
  players: Player[];
  remainingMs: number;
}

/** 顶部回合状态栏：轮次、身份、比分、连击、倒计时 */
export function RoundBar({ room, players, remainingMs }: RoundBarProps) {
  const drawer = players.find((p) => p.id === room.round.drawerId);
  const ratio = Math.max(0, Math.min(1, remainingMs / room.round.durationMs));
  const urgent = remainingMs <= 15000 && room.round.phase === "drawing";

  return (
    <div className="sticker flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink bg-lemon-400 font-mono text-lg font-black shadow-sticker-sm">
            {Math.max(room.round.index, 1)}
          </span>
          <div className="leading-tight">
            <p className="font-doodle text-lg tracking-wide">第 {Math.max(room.round.index, 1)} 轮</p>
            <p className="text-xs font-bold text-ink/50">
              {room.round.phase === "drawing" ? "作画中" : room.round.phase === "waiting" ? "准备中" : "已结算"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {drawer && (
            <span className="chip bg-lemon-300">
              <Pencil className="h-3.5 w-3.5" strokeWidth={3} />
              画手 {drawer.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {players.map((player) => (
            <div key={player.id} className="flex items-center gap-2">
              <Avatar player={player} size={36} />
              <div className="leading-tight">
                <p className="max-w-[72px] truncate text-xs font-bold text-ink/60">{player.name}</p>
                <p className="font-mono text-lg font-black leading-none">{player.score}</p>
              </div>
              {player.combo > 0 && (
                <span className="chip bg-tomato py-0.5 text-xs text-white">
                  <Flame className="h-3 w-3" strokeWidth={3} />
                  {player.combo}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "w-14 shrink-0 text-center font-mono text-lg font-black",
            urgent ? "text-tomato animate-jiggle" : "text-ink",
          )}
        >
          {clockTime(remainingMs)}
        </span>
        <div className="h-4 flex-1 overflow-hidden rounded-full border-[3px] border-ink bg-paper">
          <motion.div
            className={cn("h-full", urgent ? "bg-tomato" : "bg-lemon-500")}
            animate={{ width: `${ratio * 100}%` }}
            transition={{ ease: "linear", duration: 0.25 }}
          />
        </div>
      </div>
    </div>
  );
}
