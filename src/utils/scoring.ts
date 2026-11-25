/** 回合限时（毫秒）：给画手留足时间，别急着催 */
export const ROUND_MS = 120_000;

/** 达成即结束的目标分（回合得分整体偏高，所以目标分也拉高，保证能玩到 AI 当画手的轮次） */
export const TARGET_SCORE = 2400;

/** 基础分 */
export const BASE_SCORE = 100;

/** 连击加成的单档分值 */
export const COMBO_STEP = 20;

/** 连击加成的最大档位 */
export const COMBO_CAP = 5;

export interface ScoreBreakdown {
  base: number;
  timeBonus: number;
  comboBonus: number;
  total: number;
}

/**
 * 计算本轮得分。
 * 基础分 100；剩余时间每满 1 秒 +2；当前连击每档 +20（最多 5 档）。
 */
export function computeScore(remainingMs: number, combo: number): ScoreBreakdown {
  const base = BASE_SCORE;
  const secondsLeft = Math.max(0, Math.floor(remainingMs / 1000));
  const timeBonus = Math.min(secondsLeft, 60) * 2;
  const comboBonus = Math.min(Math.max(combo, 0), COMBO_CAP) * COMBO_STEP;
  return { base, timeBonus, comboBonus, total: base + timeBonus + comboBonus };
}

/** 归一化猜测文本：去空白、去标点、转小写，用于判定是否猜中 */
export function normalizeGuess(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s，。,.!！?？、；;：:"'“”‘’（）()【】[\]]+/g, "");
}

/** 判定猜测是否命中答案：完全相同，或彼此包含答案核心词（长度≥2） */
export function isCorrect(guess: string, answer: string): boolean {
  const g = normalizeGuess(guess);
  const a = normalizeGuess(answer);
  if (!g || !a) return false;
  if (g === a) return true;
  if (a.length >= 2 && g.includes(a)) return true;
  if (g.length >= 2 && a.includes(g)) return true;
  return false;
}
