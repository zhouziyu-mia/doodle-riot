import { createPen, fallbackDoodle, SHAPE_RECIPES } from "@/utils/aiShapes";
import { makeId } from "@/utils/storage";
import { WORD_BANK, pick } from "@/utils/words";
import type { Player, Stroke } from "@/types";

/**
 * 「假 AI 搭子」：一个完全跑在本地标签页里的假玩家。
 * 不做任何网络/模型调用，靠定时器和随机数假装在思考。
 */
export const AI_ID = "ai-buddy";

/** 每隔几轮让 AI 搭子当一次画手（人机轮换），第 5、10、15… 轮归它 */
export const AI_DRAW_EVERY = 5;

const AI_NAMES: string[] = [
  "AI·大聪明",
  "AI·小机灵",
  "AI·抽象判官",
  "AI·猜谜机器人",
  "AI·临时工 007",
];

/** 装模作样的“思考中”台词 */
export const AI_THINKING: string[] = [
  "让我看看…这画的是啥？",
  "图像识别中… 3%",
  "我的神经元有点打结 😵‍💫",
  "嗯…这只手好像画歪了",
  "正在调用画笔理解模型… 加载中",
  "再给我两秒，我快想出来了",
  "这构图，很有后现代的味道",
];

/** 猜中时的得意台词 */
export const AI_CRACKED: string[] = [
  "我悟了！",
  "哈哈我看懂了！",
  "就这？小菜一碟 🕶️",
  "果然难不倒我",
];

/** 生成 AI 玩家身份 */
export function makeAiPlayer(): Player {
  return {
    id: AI_ID,
    name: pick(AI_NAMES),
    avatar: "🤖",
    color: "#8B5CF6",
    role: "guest",
    isDrawer: false,
    score: 0,
    combo: 0,
    lastSeen: Date.now(),
  };
}

/** 判断某个玩家是不是 AI 搭子 */
export function isAiPlayer(player: Player): boolean {
  return player.id === AI_ID;
}

/** AI 的瞎猜：随便挑一个和答案不一样的词条 */
export function aiWrongWord(answer: string): string {
  const pool = WORD_BANK.filter((w) => w.text !== answer);
  if (pool.length === 0) return "一个我也不知道是啥的东西";
  return pick(pool).text;
}

/** AI 猜错时给画手的提示（让它显得蠢一点） */
export const AI_WRONG_REMARKS: string[] = [
  "AI 搭子猜歪了，接着画 💪",
  "AI 搭子一脸问号 🤔",
  "AI 搭子挠了挠硅胶脑袋",
  "AI 搭子：这不是我认识的东西",
];

/**
 * AI 看完画后的开场白：按笔画数分档，让它显得是真的在“看图”。
 * （它并不认识答案，只能数线条、看轮廓。）
 */
export function aiObserve(strokeCount: number): string {
  if (strokeCount <= 2) {
    return pick([
      "就…就这么两笔？我先琢磨琢磨",
      "信息量有点少，我眯着眼看",
      "你这属于极简主义的抽象派",
    ]);
  }
  if (strokeCount <= 6) {
    return pick([
      "嗯…线条不多，但有点意思",
      "让我顺着这几笔描一下轮廓",
      "有点像那个啥…让我想想",
    ]);
  }
  return pick([
    "细节不少啊，我一行行扫描",
    "这画得挺满，我得放大看看",
    "构图丰富，我的小脑袋有点转不过来",
  ]);
}

/** AI 顺着分类提示“推理”的台词，伪装成是靠分析画面得出来的 */
export function aiAnalysisLine(hint: string): string {
  const category = hint.split("·")[0]?.trim() || "说不清";
  return pick([
    `从线条结构看，像是「${category}」那一挂的…`,
    `我识别到「${category}」的轮廓特征…`,
    `嗯…这应该是个「${category}」类的东西`,
  ]);
}

/** AI 要猜错几次：画得越少它越看不出来，全靠“看图” */
export function aiWrongTimes(strokeCount: number): number {
  if (strokeCount <= 2) return 3;
  if (strokeCount <= 6) return 2;
  return 1;
}

/** AI 拿起画笔时的开场白 */
export const AI_DRAW_START: string[] = [
  "这轮换我来画！我可是有美术功底的 🎨",
  "让我来露一手…（其实我不太会）",
  "轮到我表演了，准备好被震撼吧",
];

/** AI 画完后的台词 */
export const AI_DRAW_DONE: string[] = [
  "画好了！看懂了吗？😏",
  "完成！这可是一幅杰作",
  "我的大作完成了，快猜吧",
];

/** AI 的画笔颜色：以它的主题紫为主 */
const AI_BRUSH_COLORS: string[] = ["#8B5CF6", "#8B5CF6", "#6D28D9", "#2E9BFF"];

/** 查词条对应的简笔画图纸 */
export function shapeFor(word: string): string {
  return WORD_BANK.find((w) => w.text === word)?.shape ?? "";
}

/**
 * AI 的“画技”：照着自己那份简笔画图纸动笔，一笔一笔落在线条上，
 * 画出来的至少能认出来是个啥（但它自己并不知道画的是啥）。
 */
export function makeAiStrokes(shape: string): Stroke[] {
  const pen = createPen();
  (SHAPE_RECIPES[shape] ?? fallbackDoodle)(pen);
  const color = pick(AI_BRUSH_COLORS);
  const size = pick([5, 8]);
  return pen.done().map((points) => ({
    id: makeId("ai"),
    playerId: AI_ID,
    color,
    size,
    erase: false,
    points,
  }));
}
