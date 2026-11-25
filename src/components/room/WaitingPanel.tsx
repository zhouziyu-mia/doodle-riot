import { motion } from "framer-motion";
import { Bot, Check, Copy, Hourglass, Play } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { isOnline } from "@/store/useRoomStore";
import { isAiPlayer } from "@/utils/aiBuddy";
import type { Player } from "@/types";

interface WaitingPanelProps {
  code: string;
  players: Player[];
  now: number;
  isHost: boolean;
  onStart: () => void;
  onInviteAi?: () => void;
}

/** 开局前的等待面板：展示房码、到场玩家、开始按钮 */
export function WaitingPanel({ code, players, now, isHost, onStart, onInviteAi }: WaitingPanelProps) {
  const [copied, setCopied] = useState(false);
  const ready = players.length >= 2;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/room/${code}`);
    } catch {
      /* ignore */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="sticker bg-paper p-6 text-center sm:p-8">
      <motion.div
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-ink bg-lemon-400 shadow-sticker"
      >
        <Hourglass className="h-8 w-8" strokeWidth={3} />
      </motion.div>

      <h2 className="mt-4 font-doodle text-2xl tracking-wide">
        {ready ? "人到齐了，开画！" : "等待你的搭子出现…"}
      </h2>
      <p className="mt-1 text-sm font-bold text-ink/55">
        {ready ? "点击开始，第一轮由房主先当画手" : "把下面这串房码发给 TA，让 TA 输码加入"}
      </p>

      <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-2xl border-[3px] border-ink bg-lemon-grad px-6 py-4 shadow-sticker-sm">
        <span className="font-mono text-4xl font-black tracking-[0.25em]">{code}</span>
      </div>

      <button type="button" onClick={copy} className="btn-plain mt-4">
        {copied ? <Check className="h-5 w-5" strokeWidth={3} /> : <Copy className="h-5 w-5" strokeWidth={3} />}
        {copied ? "复制好啦" : "复制邀请链接"}
      </button>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        {players.map((player) => (
          <div key={player.id} className="sticker-sm flex items-center gap-2 px-3 py-2">
            <Avatar player={player} size={34} online={isOnline(player, now)} />
            <span className="text-sm font-bold">{player.name}</span>
            {isAiPlayer(player) ? (
              <span className="chip bg-grape py-0 px-2 text-[10px] text-white">AI</span>
            ) : (
              <span className="chip bg-lemon-200 py-0 px-2 text-[10px]">
                {player.role === "host" ? "房主" : "房客"}
              </span>
            )}
          </div>
        ))}
        {!ready && (
          <div className="sticker-sm flex items-center gap-2 border-dashed px-3 py-2 text-ink/40">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] border-dashed border-ink/30 text-lg">
              ？
            </span>
            <span className="text-sm font-bold">等待加入…</span>
          </div>
        )}
      </div>

      {isHost ? (
        <>
          <button
            type="button"
            onClick={onStart}
            disabled={!ready}
            className="btn-primary mt-7 w-full sm:w-auto sm:px-10"
            style={!ready ? { opacity: 0.55 } : undefined}
          >
            <Play className="h-5 w-5" strokeWidth={3} />
            开始第一轮
          </button>
          {!ready && onInviteAi && (
            <button type="button" onClick={onInviteAi} className="btn-lemon mt-3 w-full sm:w-auto sm:px-10">
              <Bot className="h-5 w-5" strokeWidth={3} />
              邀请 AI 搭子
            </button>
          )}
        </>
      ) : (
        <p className="mt-7 inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-lemon-200 px-5 py-2.5 font-bold">
          <Hourglass className="h-4 w-4" strokeWidth={3} />
          等房主点开始…
        </p>
      )}
    </div>
  );
}
