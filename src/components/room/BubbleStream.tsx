import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ChatBubble, Player } from "@/types";

interface BubbleStreamProps {
  bubbles: ChatBubble[];
  players: Player[];
  now: number;
}

const LIFETIME = 6000;
const MAX_VISIBLE = 7;

/** 从底部飘出的吐槽气泡（含猜错的猜测内容） */
export function BubbleStream({ bubbles, players, now }: BubbleStreamProps) {
  const recent = bubbles.filter((b) => now - b.at < LIFETIME).slice(-MAX_VISIBLE);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {recent.map((bubble, index) => {
        const player = players.find((p) => p.id === bubble.playerId);
        const left = 8 + ((hash(bubble.id) % 60) + index * 7) % 74;
        return (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, y: 24, scale: 0.7 }}
            animate={{ opacity: 1, y: -140, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="absolute bottom-0"
            style={{ left: `${left}%` }}
          >
            <div
              className={cn(
                "flex max-w-[220px] items-center gap-2 rounded-2xl border-[3px] border-ink px-3 py-1.5 shadow-sticker-sm",
                bubble.kind === "guess" ? "bg-tomato text-white" : "bg-paper",
              )}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink text-xs"
                style={{ background: player?.color ?? "#FFD60A" }}
              >
                {player?.avatar ?? "🐤"}
              </span>
              <span className="truncate text-sm font-bold">{bubble.text}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function hash(input: string): number {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value * 31 + input.charCodeAt(i)) >>> 0;
  }
  return value;
}
