import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

/** 大厅主标题：夸张贴纸感 */
export function BigTitle() {
  return (
    <header className="relative text-center">
      <motion.div
        initial={{ scale: 0.7, rotate: -6, opacity: 0 }}
        animate={{ scale: 1, rotate: -2, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 12 }}
        className="inline-block"
      >
        <h1
          className="font-doodle text-6xl leading-none tracking-wider text-tomato sm:text-7xl md:text-8xl"
          style={{ textShadow: "4px 4px 0 #141414" }}
        >
          涂鸦乱猜
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-4 inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-paper px-4 py-1.5 text-sm font-bold shadow-sticker-sm sm:text-base"
      >
        <Sparkles className="h-4 w-4" strokeWidth={3} />
        你画得越抽象，猜的人越上头 · DOODLE RIOT
      </motion.p>
    </header>
  );
}
