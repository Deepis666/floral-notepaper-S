import { describe, expect, test } from "vitest";
import { findRanges, replaceAllMatches } from "./findRanges";

describe("findRanges", () => {
  test("finds all non-overlapping matches", () => {
    expect(findRanges("ababab", "ab", false)).toEqual([
      { start: 0, end: 2 },
      { start: 2, end: 4 },
      { start: 4, end: 6 },
    ]);
  });

  test("is case-insensitive by default flag", () => {
    expect(findRanges("aAbB", "ab", false)).toEqual([{ start: 1, end: 3 }]);
    expect(findRanges("aAbB", "ab", true)).toEqual([]);
  });

  test("returns empty for empty query or no match", () => {
    expect(findRanges("abc", "", false)).toEqual([]);
    expect(findRanges("abc", "xyz", false)).toEqual([]);
  });

  test("handles multi-byte characters by code unit offsets", () => {
    const value = "中文 test 中文";
    const matches = findRanges(value, "中文", false);
    expect(matches).toEqual([
      { start: 0, end: 2 },
      { start: 8, end: 10 },
    ]);
  });
});

describe("replaceAllMatches", () => {
  test("replaces every occurrence once", () => {
    const result = replaceAllMatches("a-a-a", "a", "bb", false);
    expect(result).toEqual({ value: "bb-bb-bb", count: 3 });
  });

  test("does not re-expand when replacement contains the query", () => {
    const result = replaceAllMatches("aa", "a", "aa", false);
    expect(result).toEqual({ value: "aaaa", count: 2 });
  });

  test("respects case sensitivity", () => {
    expect(replaceAllMatches("Ab aB ab", "ab", "X", true).count).toBe(1);
    expect(replaceAllMatches("Ab aB ab", "ab", "X", false).count).toBe(3);
  });

  test("returns original value when nothing matches", () => {
    const result = replaceAllMatches("abc", "zzz", "X", false);
    expect(result).toEqual({ value: "abc", count: 0 });
  });
});
