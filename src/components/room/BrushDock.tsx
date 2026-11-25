import { Circle, Eraser, Trash2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRUSH_COLORS, BRUSH_SIZES } from "@/utils/words";

interface BrushDockProps {
  color: string;
  size: number;
  erase: boolean;
  disabled: boolean;
  onColor: (color: string) => void;
  onSize: (size: number) => void;
  onToggleErase: () => void;
  onUndo: () => void;
  onClear: () => void;
}

/** 画笔工具条：颜色、粗细、橡皮、撤销、清空 */
export function BrushDock({
  color,
  size,
  erase,
  disabled,
  onColor,
  onSize,
  onToggleErase,
  onUndo,
  onClear,
}: BrushDockProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", disabled && "opacity-50")}>
      <div className="sticker-sm flex items-center gap-2 px-3 py-2">
        {BRUSH_COLORS.map((item) => (
          <button
            key={item}
            type="button"
            disabled={disabled}
            onClick={() => {
              onColor(item);
              if (erase) onToggleErase();
            }}
            aria-label={`画笔颜色 ${item}`}
            className={cn(
              "h-7 w-7 rounded-full border-[3px] border-ink transition-transform",
              !erase && color === item ? "scale-110 shadow-sticker-sm" : "hover:scale-105",
            )}
            style={{ background: item }}
          />
        ))}
      </div>

      <div className="sticker-sm flex items-center gap-2 px-3 py-2">
        {BRUSH_SIZES.map((item) => (
          <button
            key={item}
            type="button"
            disabled={disabled}
            onClick={() => onSize(item)}
            aria-label={`画笔粗细 ${item}`}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-ink transition-all",
              size === item ? "bg-lemon-400 shadow-sticker-sm" : "bg-paper hover:bg-lemon-100",
            )}
          >
            <Circle className="text-ink" strokeWidth={3} style={{ width: item, height: item }} />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onToggleErase}
          className={cn(
            "btn-sticker px-4 py-2 text-sm",
            erase ? "bg-tomato text-white" : "bg-paper text-ink",
          )}
        >
          <Eraser className="h-4 w-4" strokeWidth={3} />
          橡皮
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onUndo}
          className="btn-sticker bg-paper px-4 py-2 text-sm text-ink"
        >
          <Undo2 className="h-4 w-4" strokeWidth={3} />
          撤销
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          className="btn-sticker bg-paper px-4 py-2 text-sm text-ink"
        >
          <Trash2 className="h-4 w-4" strokeWidth={3} />
          清空
        </button>
      </div>
    </div>
  );
}
