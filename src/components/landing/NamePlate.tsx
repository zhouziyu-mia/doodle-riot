import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AVATARS } from "@/utils/words";

interface NamePlateProps {
  name: string;
  avatar: string;
  onName: (name: string) => void;
  onAvatar: (avatar: string) => void;
}

/** 起名卡片：昵称输入 + 贴纸头像挑选 */
export function NamePlate({ name, avatar, onName, onAvatar }: NamePlateProps) {
  return (
    <section className="sticker p-5 sm:p-6">
      <h2 className="font-doodle text-2xl tracking-wide">
        先给自个儿起个名 <span className="text-tomato">!</span>
      </h2>
      <p className="mt-1 text-sm text-ink/60">名字和头像会出现在对方的屏幕上（要脸就起好听点）</p>

      <input
        value={name}
        onChange={(event) => onName(event.target.value)}
        maxLength={12}
        placeholder="例如：灵魂画手小王"
        className="field-sticker mt-4"
        aria-label="昵称"
      />

      <div className="mt-4 flex flex-wrap gap-2.5">
        {AVATARS.map((item) => (
          <motion.button
            key={item}
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => onAvatar(item)}
            aria-label={`选择头像 ${item}`}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink text-xl transition-all",
              avatar === item
                ? "bg-lemon-400 shadow-sticker-sm -translate-y-0.5"
                : "bg-paper hover:bg-lemon-100",
            )}
          >
            {item}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
