import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { pick } from "@/utils/words";

const JOIN_ERRORS = [
  "这码像是隔壁老王的，再核对一下？",
  "查无此房…是不是少输了一位？",
  "房码不对哦，去问问你的搭子",
];

interface JoinPanelProps {
  onJoin: (code: string) => boolean;
}

/** 输码加入面板 */
export function JoinPanel({ onJoin }: JoinPanelProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const raw = code.trim().toUpperCase();
    if (raw.length < 4) {
      setError(pick(JOIN_ERRORS));
      setShakeKey((v) => v + 1);
      return;
    }
    const ok = onJoin(raw);
    if (!ok) {
      setError(pick(JOIN_ERRORS));
      setShakeKey((v) => v + 1);
    }
  };

  return (
    <section className="sticker p-5 sm:p-6">
      <h2 className="font-doodle text-2xl tracking-wide">我有房码，直接进</h2>
      <p className="mt-1 text-sm text-ink/60">找搭子要 4 位房码，输进来加入 TA 的画布</p>

      <motion.form
        key={shakeKey}
        onSubmit={handleSubmit}
        animate={shakeKey > 0 ? { x: [0, -10, 10, -7, 7, 0] } : undefined}
        transition={{ duration: 0.4 }}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <input
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase().slice(0, 4));
            setError("");
          }}
          placeholder="ABCD"
          aria-label="房间码"
          className="field-sticker flex-1 font-mono text-2xl tracking-[0.4em] uppercase"
        />
        <button type="submit" className="btn-primary sm:w-auto">
          <LogIn className="h-5 w-5" strokeWidth={3} />
          加入
        </button>
      </motion.form>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-xl border-[3px] border-ink bg-tomato px-3 py-2 text-sm font-bold text-white shadow-sticker-sm"
        >
          {error}
        </motion.p>
      )}
    </section>
  );
}
