/** 把毫秒格式化为 0:00 / 1:05 形式 */
export function clockTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** 把毫秒格式化为「12.3 秒」 */
export function secondsText(ms: number): string {
  return `${Math.max(0, ms / 1000).toFixed(1)} 秒`;
}

/** 取昵称首字，用于头像兜底 */
export function initialOf(name: string): string {
  return name.trim().slice(0, 1) || "?";
}
