import { describe, expect, it } from "vitest";
import { drawWord, pick, pickDifferent, titleFor, WORD_BANK } from "@/utils/words";
import { SHAPE_RECIPES } from "@/utils/aiShapes";
import { AI_ID, makeAiStrokes, shapeFor } from "@/utils/aiBuddy";

describe("drawWord", () => {
  it("返回词库里的一条词条", () => {
    const word = drawWord();
    expect(WORD_BANK.some((item) => item.text === word.text)).toBe(true);
    expect(word.hint.length).toBeGreaterThan(0);
  });

  it("会避开上一轮的词条", () => {
    const avoid = WORD_BANK[0].text;
    for (let i = 0; i < 30; i += 1) {
      expect(drawWord(avoid).text).not.toBe(avoid);
    }
  });
});

describe("pick / pickDifferent", () => {
  it("pick 只会从给定数组里取", () => {
    const pool = ["a", "b", "c"];
    for (let i = 0; i < 20; i += 1) {
      expect(pool).toContain(pick(pool));
    }
  });

  it("pickDifferent 尽量避开指定值", () => {
    expect(pickDifferent(["a", "b"], "a")).toBe("b");
  });
});

describe("titleFor", () => {
  it("按分数给出对应沙雕称号", () => {
    expect(titleFor(2500)).toContain("神");
    expect(titleFor(0)).toContain("快乐参与奖");
  });
});

describe("AI 搭子的简笔画图纸", () => {
  it("每个词条都配了能画出来的图纸", () => {
    for (const word of WORD_BANK) {
      expect(SHAPE_RECIPES[word.shape], `${word.text} 缺图纸`).toBeTypeOf("function");
    }
  });

  it("照着图纸画出的笔迹都落在画布范围内", () => {
    for (const word of WORD_BANK) {
      const strokes = makeAiStrokes(shapeFor(word.text));
      expect(strokes.length, `${word.text} 一笔都没画`).toBeGreaterThan(0);
      for (const stroke of strokes) {
        expect(stroke.playerId).toBe(AI_ID);
        for (const point of stroke.points) {
          expect(point.x).toBeGreaterThanOrEqual(0);
          expect(point.x).toBeLessThanOrEqual(1);
          expect(point.y).toBeGreaterThanOrEqual(0);
          expect(point.y).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("没图纸的词也有兜底涂鸦，不会空着画布", () => {
    expect(makeAiStrokes(shapeFor("不存在的词")).length).toBeGreaterThan(0);
  });
});
