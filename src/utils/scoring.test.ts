import { describe, expect, it } from "vitest";
import { computeScore, isCorrect, normalizeGuess } from "@/utils/scoring";

describe("computeScore", () => {
  it("按基础分 + 时间加成 + 连击加成累计", () => {
    const result = computeScore(30_000, 2);
    expect(result.base).toBe(100);
    expect(result.timeBonus).toBe(60); // 30 秒 * 2
    expect(result.comboBonus).toBe(40); // 2 档 * 20
    expect(result.total).toBe(200);
  });

  it("时间加成最多封顶 60 秒", () => {
    expect(computeScore(120_000, 0).timeBonus).toBe(120);
  });

  it("连击加成超过 5 档不再叠加", () => {
    expect(computeScore(0, 99).comboBonus).toBe(100);
  });

  it("超时后没有时间加成", () => {
    expect(computeScore(-5000, 0).total).toBe(100);
  });
});

describe("normalizeGuess", () => {
  it("去除标点与空白并转小写", () => {
    expect(normalizeGuess("  Hello，World!  ")).toBe("helloworld");
  });
});

describe("isCorrect", () => {
  it("完全一致算猜中", () => {
    expect(isCorrect("戴墨镜的土豆", "戴墨镜的土豆")).toBe(true);
  });

  it("忽略标点空白也算猜中", () => {
    expect(isCorrect("戴墨镜 的土豆！", "戴墨镜的土豆")).toBe(true);
  });

  it("猜中答案核心词也算", () => {
    expect(isCorrect("土豆", "戴墨镜的土豆")).toBe(true);
  });

  it("完全不沾边判为错误", () => {
    expect(isCorrect("西红柿", "戴墨镜的土豆")).toBe(false);
  });

  it("空输入不算猜中", () => {
    expect(isCorrect("   ", "戴墨镜的土豆")).toBe(false);
  });
});
