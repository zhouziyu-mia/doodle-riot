import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Toast } from "@/types";

interface ToastLayerProps {
  toast: Toast | null;
}

const TONE = {
  good: { icon: CheckCircle2, bg: "bg-mint" },
  bad: { icon: AlertTriangle, bg: "bg-tomato text-white" },
  info: { icon: Info, bg: "bg-paper" },
} as const;

/** 顶部弹出的沙雕提示条 */
export function ToastLayer({ toast }: ToastLayerProps) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-5 z-50 -translate-x-1/2">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -40, opacity: 0, rotate: -3 }}
            animate={{ y: 0, opacity: 1, rotate: -1 }}
            exit={{ y: -30, opacity: 0 }}
            className={cn(
              "flex items-center gap-2 rounded-full border-[3px] border-ink px-5 py-2.5 font-bold shadow-sticker",
              TONE[toast.tone].bg,
            )}
          >
            {(() => {
              const Icon = TONE[toast.tone].icon;
              return <Icon className="h-5 w-5" strokeWidth={3} />;
            })()}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
