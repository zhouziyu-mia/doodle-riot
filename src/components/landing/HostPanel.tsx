import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Brush, Copy, DoorOpen, Users } from "lucide-react";
import { SLOGANS, pick } from "@/utils/words";

interface HostPanelProps {
  code: string;
  waitingCount: number;
  onEnter: () => void;
  onInviteAi?: () => void;
}

const WAITING_LINES = [
  "正在等你的搭子出现…",
  "把房码甩给 TA，人齐就开画！",
  "对方还在路上，先热身一下手腕",
  ...SLOGANS.slice(0, 2),
];

/** 开好房之后的房间码面板 */
export function HostPanel({ code, waitingCount, onEnter, onInviteAi }: HostPanelProps) {
  const [copied, setCopied] = useState(false);
  const [line] = useState(() => pick(WAITING_LINES));
  const ready = waitingCount >= 2;

  const copy = async () => {
    const link = `${window.location.origin}/room/${code}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* 剪贴板不可用时忽略 */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="sticker bg-lemon-grad p-5 sm:p-6">
      <h2 className="font-doodle text-2xl tracking-wide">画布开好了！</h2>
      <p className="mt-1 text-sm text-ink/60">把这串房码发给你的伙伴，让 TA 输码加入</p>

      <motion.div
        initial={{ scale: 0.8, rotate: 3 }}
        animate={{ scale: 1, rotate: -1 }}
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-[3px] border-ink bg-paper py-5 shadow-sticker-sm"
      >
        {code.split("").map((char, index) => (
          <span
            key={index}
            className="font-mono text-4xl font-black tracking-widest sm:text-5xl"
            style={{ color: index % 2 === 0 ? "#141414" : "#FF5A5F" }}
          >
            {char}
          </span>
        ))}
      </motion.div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={copy} className="btn-plain flex-1">
          <Copy className="h-5 w-5" strokeWidth={3} />
          {copied ? "复制好啦！" : "复制邀请链接"}
        </button>
        <button type="button" onClick={onEnter} className="btn-primary flex-1">
          <Brush className="h-5 w-5" strokeWidth={3} />
          先进画布
        </button>
      </div>

      {!ready && onInviteAi && (
        <button type="button" onClick={onInviteAi} className="btn-lemon mt-3 w-full">
          <Bot className="h-5 w-5" strokeWidth={3} />
          没搭子？邀请 AI 搭子
        </button>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm font-bold text-ink/70">
        <Users className="h-4 w-4" strokeWidth={3} />
        {ready ? (
          <span className="text-ink">伙伴已就位，冲！</span>
        ) : (
          <span>
            当前 {waitingCount} / 2 人 · {line}
          </span>
        )}
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/50">
        <DoorOpen className="h-3.5 w-3.5" strokeWidth={3} />
        提示：同一个浏览器开两个标签页，也能当作两个人一起玩
      </p>
    </section>
  );
}
