import { describe, expect, it } from "bun:test";
import { PRESETS } from "../presets";
import { buildLevelGrid, createLetterGrid, resolveGridLevel } from "../utils/gridGenerator";

describe("resolveGridLevel", () => {
  it("keeps custom letters when provided", () => {
    const level = { letters: "A B C D", columns: 2, rows: 2 };
    const fallback = { letters: "W X Y Z", columns: 2, rows: 2 };
    const resolved = resolveGridLevel(level, fallback);
    expect(resolved.letters).toBe("A B C D");
  });

  it("inherits fallback letters when level letters is empty", () => {
    const level = { letters: "", columns: 2, rows: 2 };
    const fallback = { letters: "W X Y Z", columns: 2, rows: 2 };
    const resolved = resolveGridLevel(level, fallback);
    expect(resolved.letters).toBe("W X Y Z");
  });

  it("inherits fallback letters when level letters is only whitespace", () => {
    const level = { letters: "   ", columns: 2, rows: 2 };
    const fallback = { letters: "W X Y Z", columns: 2, rows: 2 };
    const resolved = resolveGridLevel(level, fallback);
    expect(resolved.letters).toBe("W X Y Z");
  });

  it("does not alter level when fallback is empty", () => {
    const level = { letters: "", columns: 2, rows: 2 };
    const fallback = { letters: "", columns: 2, rows: 2 };
    const resolved = resolveGridLevel(level, fallback);
    expect(resolved.letters).toBe("");
  });
});

describe("buildLevelGrid", () => {
  it("builds a grid with punctuation and spaces", () => {
    const level = {
      letters: "ASDFG HJKL;",
      columns: 10,
      rows: 1,
    };
    const grid = buildLevelGrid(level, "Level 1");
    expect(grid).toHaveLength(1);
    expect(grid[0]).toEqual(["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"]);
  });

  it("throws when letters count is less than required dimensions", () => {
    const level = {
      letters: "A B C",
      columns: 2,
      rows: 2,
    };
    expect(() => buildLevelGrid(level, "Level 1")).toThrow(/requires at least 4 letters/);
  });

  it("throws when duplicate letters are present", () => {
    const level = {
      letters: "A B C A",
      columns: 2,
      rows: 2,
    };
    expect(() => buildLevelGrid(level, "Level 1")).toThrow(/contains duplicate letters/);
  });
});

describe("createLetterGrid", () => {
  it("creates letter grid for position_based_columns preset", () => {
    const preset = PRESETS[0]!;
    const grid = createLetterGrid(preset.levels);
    expect(grid).toHaveLength(30);
    expect(grid[0]).toHaveLength(10);
    expect(grid[0]?.[0]).toBe("AQ");
  });

  it("creates letter grid when level 2 inherits keys from level 1", () => {
    const preset = PRESETS[1]!; // position_based_16_9 has blank level 2
    expect(preset.levels.level2.letters).toBe("");
    const grid = createLetterGrid(preset.levels);
    expect(grid).toHaveLength(36); // 6 rows * 6 rows
    expect(grid[0]).toHaveLength(25); // 5 cols * 5 cols
    expect(grid[0]?.[0]).toBe("QQ");
  });
});
