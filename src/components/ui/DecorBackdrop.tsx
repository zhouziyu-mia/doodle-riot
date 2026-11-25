import { motion } from "framer-motion";

const DECOR = [
  { emoji: "✏️", top: "8%", left: "6%", size: 46, rotate: -14, delay: 0 },
  { emoji: "🎨", top: "16%", right: "8%", size: 52, rotate: 12, delay: 0.4 },
  { emoji: "💡", top: "68%", left: "4%", size: 44, rotate: 8, delay: 0.8 },
  { emoji: "⭐", top: "78%", right: "10%", size: 40, rotate: -10, delay: 0.2 },
  { emoji: "🖌️", top: "42%", left: "2%", size: 40, rotate: 16, delay: 1.0 },
  { emoji: "🧠", top: "56%", right: "3%", size: 44, rotate: -8, delay: 0.6 },
  { emoji: "😂", top: "88%", left: "22%", size: 38, rotate: 6, delay: 1.2 },
  { emoji: "💥", top: "6%", right: "30%", size: 42, rotate: -6, delay: 0.9 },
];

/** 背景漂浮的手绘贴纸装饰 */
export function DecorBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {DECOR.map((item, index) => (
        <motion.span
          key={index}
          className="absolute select-none"
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            fontSize: item.size,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.9, scale: 1, rotate: item.rotate }}
          transition={{ delay: item.delay, type: "spring", stiffness: 160, damping: 12 }}
        >
          <span className="inline-block animate-floaty" style={{ animationDelay: `${item.delay}s` }}>
            {item.emoji}
          </span>
        </motion.span>
      ))}
    </div>
  );
}
