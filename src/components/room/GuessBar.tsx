import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Eye, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK = ["😂", "🤔", "💀", "🔥", "👍", "❓"];

interface GuessBarProps {
  isDrawer: boolean;
  word: string;
  hint: string;
  canGuess: boolean;
  pending: boolean;
  /** 画手是否已经点过「我画完了」 */
  drawerDone: boolean;
  /** 房间里有没有 AI 搭子（决定画完之后的提示文案） */
  hasAi: boolean;
  /** 这轮的画手是不是 AI 搭子（人类只能靠提示硬猜） */
  drawerIsAi: boolean;
  onGuess: (text: string) => void;
  onBubble: (text: string) => void;
  onFinish: () => void;
}

/** 词条区 + 猜词输入 + 快捷吐槽 */
export function GuessBar({
  isDrawer,
  word,
  hint,
  canGuess,
  pending,
  drawerDone,
  hasAi,
  drawerIsAi,
  onGuess,
  onBubble,
  onFinish,
}: GuessBarProps) {
  const [text, setText] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canGuess || !text.trim()) return;
    onGuess(text);
    setText("");
  };

  return (
    <div className="sticker flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="chip bg-ink text-lemon-200">
          <Eye className="h-3.5 w-3.5" strokeWidth={3} />
          {isDrawer ? "你的题目" : "题目提示"}
        </span>
        {isDrawer ? (
          <p className="font-doodle text-xl tracking-wide text-tomato">「{word || "等待开始"}」</p>
        ) : (
          <p className="font-mono text-xl tracking-[0.3em] text-ink/70">
            {"●".repeat(word.length || 0) || "● ● ●"}
          </p>
        )}
        <span className="chip bg-lemon-200 text-xs text-ink/70">{hint || "分类提示"}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {QUICK.map((emoji) => (
          <motion.button
            key={emoji}
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={() => onBubble(emoji)}
            className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-ink bg-paper text-lg shadow-sticker-sm hover:bg-lemon-100"
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      {isDrawer ? (
        drawerDone ? (
          <p className="flex items-center justify-center gap-2 rounded-xl border-[3px] border-ink/25 border-dashed bg-lemon-100 px-4 py-3 text-center text-sm font-bold text-ink/60">
            <motion.span
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              👀
            </motion.span>
            {hasAi ? "AI 搭子正盯着你的画琢磨…" : "已通知 TA：你画完了，快猜！"}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <button type="button" onClick={onFinish} className="btn-primary w-full">
              <Check className="h-5 w-5" strokeWidth={3} />
              我画完了
            </button>
            <p className="text-center text-xs font-bold text-ink/45">
              {hasAi
                ? "画好了再点，不然 AI 搭子会提前偷看乱猜"
                : "点一下告诉 TA 可以开猜了"}
            </p>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2.5">
          {drawerIsAi && (
            <p className="rounded-xl border-[3px] border-grape/40 border-dashed bg-grape/10 px-4 py-2 text-center text-xs font-bold text-ink/60">
              这轮是 AI 搭子画的抽象大作，只能靠上面的分类提示硬猜了 🤖
            </p>
          )}
          <form onSubmit={submit} className="flex gap-3">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={canGuess ? "我猜是…" : "本轮已结束"}
              disabled={!canGuess}
              aria-label="猜词输入"
              className="field-sticker flex-1"
            />
            <button
              type="submit"
              disabled={!canGuess || pending}
              className={cn("btn-primary px-5", (!canGuess || pending) && "opacity-60")}
            >
              <Send className="h-5 w-5" strokeWidth={3} />
              猜！
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
