export interface DoodleWord {
  text: string;
  hint: string;
  /** 对应 aiShapes 里的简笔画图纸，AI 当画手时照着它画 */
  shape: string;
}

/** 词库：以好画、好猜的常见东西为主，偶尔加点小拟人调味 */
export const WORD_BANK: DoodleWord[] = [
  { text: "太阳", hint: "自然", shape: "sun" },
  { text: "月亮", hint: "自然", shape: "moon" },
  { text: "彩虹", hint: "自然", shape: "rainbow" },
  { text: "云朵", hint: "自然", shape: "cloud" },
  { text: "星星", hint: "自然", shape: "star" },
  { text: "闪电", hint: "自然", shape: "lightning" },
  { text: "大树", hint: "植物", shape: "tree" },
  { text: "花朵", hint: "植物", shape: "flower" },
  { text: "仙人掌", hint: "植物", shape: "cactus" },
  { text: "蘑菇", hint: "植物", shape: "mushroom" },
  { text: "苹果", hint: "食物", shape: "apple" },
  { text: "香蕉", hint: "食物", shape: "banana" },
  { text: "西瓜", hint: "食物", shape: "watermelon" },
  { text: "草莓", hint: "食物", shape: "strawberry" },
  { text: "冰淇淋", hint: "食物", shape: "icecream" },
  { text: "蛋糕", hint: "食物", shape: "cake" },
  { text: "汉堡", hint: "食物", shape: "burger" },
  { text: "披萨", hint: "食物", shape: "pizza" },
  { text: "甜甜圈", hint: "食物", shape: "donut" },
  { text: "咖啡杯", hint: "食物", shape: "coffee" },
  { text: "猫", hint: "动物", shape: "cat" },
  { text: "小狗", hint: "动物", shape: "dog" },
  { text: "熊猫", hint: "动物", shape: "panda" },
  { text: "兔子", hint: "动物", shape: "rabbit" },
  { text: "大象", hint: "动物", shape: "elephant" },
  { text: "小鱼", hint: "动物", shape: "fish" },
  { text: "小鸟", hint: "动物", shape: "bird" },
  { text: "乌龟", hint: "动物", shape: "turtle" },
  { text: "螃蟹", hint: "动物", shape: "crab" },
  { text: "章鱼", hint: "动物", shape: "octopus" },
  { text: "蝴蝶", hint: "动物", shape: "butterfly" },
  { text: "恐龙", hint: "动物", shape: "dinosaur" },
  { text: "房子", hint: "建筑", shape: "house" },
  { text: "城堡", hint: "建筑", shape: "castle" },
  { text: "小桥", hint: "建筑", shape: "bridge" },
  { text: "汽车", hint: "交通", shape: "car" },
  { text: "自行车", hint: "交通", shape: "bicycle" },
  { text: "飞机", hint: "交通", shape: "plane" },
  { text: "帆船", hint: "交通", shape: "boat" },
  { text: "火箭", hint: "交通", shape: "rocket" },
  { text: "热气球", hint: "交通", shape: "hotair" },
  { text: "雨伞", hint: "日常物品", shape: "umbrella" },
  { text: "眼镜", hint: "日常物品", shape: "glasses" },
  { text: "气球", hint: "日常物品", shape: "balloon" },
  { text: "钥匙", hint: "日常物品", shape: "key" },
  { text: "时钟", hint: "日常物品", shape: "clock" },
  { text: "剪刀", hint: "日常物品", shape: "scissors" },
  { text: "铅笔", hint: "日常物品", shape: "pencil" },
  { text: "书本", hint: "日常物品", shape: "book" },
  { text: "帽子", hint: "日常物品", shape: "hat" },
  { text: "蜡烛", hint: "日常物品", shape: "candle" },
  { text: "灯泡", hint: "日常物品", shape: "bulb" },
  { text: "吉他", hint: "乐器", shape: "guitar" },
  { text: "钢琴", hint: "乐器", shape: "piano" },
  { text: "篮球", hint: "运动", shape: "basketball" },
  { text: "足球", hint: "运动", shape: "soccer" },
  { text: "雪人", hint: "场景", shape: "snowman" },
  { text: "棒棒糖", hint: "食物", shape: "lollipop" },
  // 下面这些加了个小特征，依旧好画好猜，但更好笑
  { text: "戴帽子的猫", hint: "动物", shape: "catHat" },
  { text: "打伞的兔子", hint: "动物", shape: "rabbitUmbrella" },
  { text: "戴眼镜的狗", hint: "动物", shape: "dogGlasses" },
  { text: "睡觉的熊猫", hint: "动物", shape: "pandaSleep" },
  { text: "会飞的鱼", hint: "动物", shape: "fishFly" },
  { text: "打领带的恐龙", hint: "动物", shape: "dinosaurTie" },
  { text: "穿毛衣的雪人", hint: "场景", shape: "snowmanSweater" },
  { text: "在笑的太阳", hint: "自然", shape: "sunSmile" },
];

/** 沙雕标语（大厅跑马灯） */
export const SLOGANS: string[] = [
  "画得像不像不重要，笑得大声才算赢 😂",
  "友情提示：画手请勿边画边笑，容易暴露答案",
  "据说 3 秒内猜中的都是天才，3 分钟没猜中的都是好朋友",
  "本游戏对美术零基础极度友好（真的）",
  "画不出来可以画个箭头指一指，规则允许（不）",
  "猜错的吐槽都会被记录在案，请谨慎发言 💀",
  "两个标签页就是两个灵魂，开整吧！",
  "温馨提示：橡皮擦不掉尴尬，但可以擦掉你画的腿",
];

/** 默认昵称（起名框的随机占位） */
export const DEFAULT_NAMES: string[] = [
  "画痴本痴",
  "灵魂画手",
  "抽象大师",
  "只会画火柴人",
  "手残党代表",
  "涂鸦小天才",
  "看不懂艺术家",
  "乱涂冠军",
];

/** 贴纸头像 */
export const AVATARS: string[] = [
  "🐤", "🐸", "🐙", "🦖", "🐧", "🦄", "🐳", "🦩", "🐝", "🦥", "🐹", "🦔",
];

/** 玩家主题色（描边与气泡区分） */
export const PLAYER_COLORS: string[] = [
  "#FF5A5F", "#2E9BFF", "#31D07A", "#8B5CF6", "#FF8A00", "#0EA5A5",
];

/** 画笔颜色 */
export const BRUSH_COLORS: string[] = [
  "#141414", "#FF5A5F", "#2E9BFF", "#31D07A", "#FF8A00", "#8B5CF6",
];

/** 画笔粗细 */
export const BRUSH_SIZES: number[] = [4, 8, 14, 22];

/** 猜错时的沙雕吐槽 */
export const WRONG_REMARKS: string[] = [
  "这画的是个啥？？",
  "再想想，差点就对了（并没有）",
  "你的想象力很丰富，可惜不是这个",
  "画手已经哭晕在画布上",
  "思路清奇，但不太对哦",
  "要不…换个角度看看？",
  "答案是它吗？不是。",
];

/** 猜中后的夸张评语 */
export const WIN_REMARKS: string[] = [
  "眼神毒辣！一眼看穿！",
  "默契度爆表，你们是亲生的吧？",
  "这都能猜出来，作弊了吧（开玩笑）",
  "画得抽象，猜得精准，绝配！",
  "脑电波对上了，信号满格！",
  "天才与天才的碰撞，火花四溅！",
];

/** 结束时按分数给出的沙雕称号 */
export const TITLES: { min: number; title: string }[] = [
  { min: 2200, title: "涂鸦界の神 🖌️" },
  { min: 1500, title: "抽象派大师 🎨" },
  { min: 800, title: "灵魂画手 ✏️" },
  { min: 300, title: "努力型选手 💪" },
  { min: 0, title: "快乐参与奖 🎉" },
];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickDifferent<T>(arr: T[], avoid: T): T {
  if (arr.length <= 1) return arr[0];
  let item = pick(arr);
  let guard = 0;
  while (item === avoid && guard < 20) {
    item = pick(arr);
    guard += 1;
  }
  return item;
}

/** 抽取一个与上一轮不同的词条 */
export function drawWord(avoidText?: string): DoodleWord {
  const pool =
    avoidText && WORD_BANK.length > 1
      ? WORD_BANK.filter((w) => w.text !== avoidText)
      : WORD_BANK;
  return pick(pool);
}

export function titleFor(score: number): string {
  return (TITLES.find((t) => score >= t.min) ?? TITLES[TITLES.length - 1]).title;
}
