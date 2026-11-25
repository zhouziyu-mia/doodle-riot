import { cn } from "@/lib/utils";
import type { Player } from "@/types";

interface AvatarProps {
  player: Player;
  size?: number;
  online?: boolean;
  className?: string;
}

/** 贴纸风格头像：粗描边圆底 + emoji + 在线小圆点 */
export function Avatar({ player, size = 44, online, className }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className="inline-flex items-center justify-center rounded-full border-[3px] border-ink shadow-sticker-sm"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.5,
          background: "#FFF6C2",
        }}
      >
        {player.avatar}
      </span>
      {online !== undefined && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-ink",
            online ? "bg-mint" : "bg-ink/30",
          )}
        />
      )}
    </span>
  );
}
