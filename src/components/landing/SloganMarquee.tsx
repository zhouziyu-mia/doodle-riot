import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { SLOGANS } from "@/utils/words";

/** 沙雕标语跑马灯：整条循环滚动，点击可换一条 */
export function SloganMarquee() {
  const [offset, setOffset] = useState(0);
  const [text, setText] = useState(SLOGANS[0]);

  useEffect(() => {
    const timer = window.setInterval(() => setOffset((v) => v + 1), 50);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const rotate = window.setInterval(
      () => setText(SLOGANS[Math.floor(Math.random() * SLOGANS.length)]),
      9000,
    );
    return () => window.clearInterval(rotate);
  }, []);

  const shift = (offset % 120) - 120;

  return (
    <button
      type="button"
      onClick={() => setText(SLOGANS[Math.floor(Math.random() * SLOGANS.length)])}
      className="group flex w-full items-center gap-3 overflow-hidden rounded-full border-[3px] border-ink bg-ink px-4 py-2 text-left shadow-sticker"
      title="点我换一句"
    >
      <Megaphone className="h-5 w-5 shrink-0 text-lemon-400" strokeWidth={3} />
      <span className="relative block h-6 flex-1 overflow-hidden">
        <span
          className="absolute whitespace-nowrap font-bold text-lemon-200 transition-none"
          style={{ transform: `translateX(${shift}px)` }}
        >
          {`${text} · ${text}`}
        </span>
      </span>
    </button>
  );
}
