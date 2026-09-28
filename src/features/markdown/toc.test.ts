import { describe, expect, test } from "vitest";
import { findActiveHeadingIndex, tocEntriesFromHeadings } from "./toc";

describe("tocEntriesFromHeadings", () => {
  test("extracts id/text/level from heading elements", () => {
    const entries = tocEntriesFromHeadings([
      { id: "a", tagName: "H1", textContent: " 一级 " },
      { id: "b", tagName: "H2", textContent: "二级" },
      { id: "c", tagName: "H6", textContent: "六级" },
    ]);

    expect(entries).toEqual([
      { id: "a", text: "一级", level: 1 },
      { id: "b", text: "二级", level: 2 },
      { id: "c", text: "六级", level: 6 },
    ]);
  });

  test("skips headings without id or with empty text", () => {
    const entries = tocEntriesFromHeadings([
      { id: null, tagName: "H1", textContent: "无锚点" },
      { id: "x", tagName: "H2", textContent: "   " },
      { id: "ok", tagName: "H3", textContent: "可用" },
    ]);

    expect(entries).toEqual([{ id: "ok", text: "可用", level: 3 }]);
  });

  test("ignores non-heading tag names", () => {
    const entries = tocEntriesFromHeadings([
      { id: "p", tagName: "P", textContent: "段落" },
      { id: "h7", tagName: "H7", textContent: "非法" },
    ]);

    expect(entries).toEqual([]);
  });
});

describe("findActiveHeadingIndex", () => {
  const offsets = [0, 300, 700, 1200];

  test("activates the first heading once it reaches the top area", () => {
    expect(findActiveHeadingIndex(offsets, 0, 96)).toBe(0);
  });

  test("returns -1 when all headings are still below the scroll line", () => {
    expect(findActiveHeadingIndex([500, 900], 100, 96)).toBe(-1);
  });

  test("returns the last heading above the scroll line", () => {
    expect(findActiveHeadingIndex(offsets, 300, 96)).toBe(1);
    expect(findActiveHeadingIndex(offsets, 760, 96)).toBe(2);
    expect(findActiveHeadingIndex(offsets, 5000, 96)).toBe(3);
  });

  test("uses tolerance so a heading activates slightly before reaching top", () => {
    // 700 - 96 = 604 起第二节激活
    expect(findActiveHeadingIndex(offsets, 604, 96)).toBe(2);
    expect(findActiveHeadingIndex(offsets, 603, 96)).toBe(1);
  });

  test("handles empty offset list", () => {
    expect(findActiveHeadingIndex([], 100)).toBe(-1);
  });
});
