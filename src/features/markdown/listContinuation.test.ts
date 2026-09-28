import { describe, expect, test } from "vitest";
import { listContinuation } from "./listContinuation";

/** 构造 "prefix|caret|suffix" 形式的输入，返回 (结果, 光标位置) */
function run(line: string): ReturnType<typeof listContinuation> {
  const caret = line.indexOf("|");
  const value = line.replace("|", "");
  return listContinuation(value, caret);
}

describe("listContinuation — unordered", () => {
  test.each(["- item|", "* item|", "+ item|"])("continues marker for %s", (line) => {
    const result = run(line);
    const marker = line[0];
    expect(result).toEqual({
      replaceStart: caretOf(line),
      replaceEnd: caretOf(line),
      insert: `\n${marker} `,
    });
  });

  test("preserves indentation", () => {
    expect(run("  - a|")?.insert).toBe("\n  - ");
  });

  test("keeps trailing text after the caret on the current line", () => {
    const result = run("- it|em");
    expect(result?.insert).toBe("\n- ");
    expect(result?.replaceStart).toBe(4);
  });

  test("continues when the caret sits before existing content", () => {
    expect(run("- |item")?.insert).toBe("\n- ");
  });

  test("empty item exits the list by removing the marker", () => {
    const result = run("- |");
    expect(result).toEqual({ replaceStart: 0, replaceEnd: 2, insert: "" });
  });
});

describe("listContinuation — ordered", () => {
  test("increments the number", () => {
    const result = run("3. third|");
    expect(result?.insert).toBe("\n4. ");
  });

  test("keeps the ) delimiter", () => {
    expect(run("2) x|")?.insert).toBe("\n3) ");
  });

  test("empty ordered item exits", () => {
    expect(run("1. |")).toEqual({ replaceStart: 0, replaceEnd: 3, insert: "" });
  });
});

describe("listContinuation — task list", () => {
  test("continues as unchecked item", () => {
    expect(run("- [ ] buy milk|")?.insert).toBe("\n- [ ] ");
  });

  test("checked item continues unchecked", () => {
    expect(run("- [x] done|")?.insert).toBe("\n- [ ] ");
  });

  test("empty task item removes the whole prefix", () => {
    expect(run("- [ ] |")).toEqual({ replaceStart: 0, replaceEnd: 6, insert: "" });
  });
});

describe("listContinuation — quote", () => {
  test("continues the quote prefix", () => {
    expect(run("> quote|")?.insert).toBe("\n> ");
  });

  test("bare > without space also continues with space", () => {
    expect(run(">quote|")?.insert).toBe("\n> ");
  });

  test("empty quote line exits by removing the prefix", () => {
    expect(run("> |")).toEqual({ replaceStart: 0, replaceEnd: 2, insert: "" });
  });

  test("list inside a quote continues with both prefixes", () => {
    expect(run("> - a|")?.insert).toBe("\n> - ");
  });
});

describe("listContinuation — non-intervention", () => {
  test("plain text returns null", () => {
    expect(run("hello world|")).toBeNull();
  });

  test("heading line returns null", () => {
    expect(run("## title|")).toBeNull();
  });

  test("inside an unclosed fenced block returns null", () => {
    const value = "```js\nconst a = 1;\nconst b = 2;";
    expect(listContinuation(value, value.length)).toBeNull();
  });

  test("after a closed fenced block list continuation resumes", () => {
    const value = "```js\nconst a = 1;\n```\n- item|".replace("|", "");
    expect(listContinuation(value, value.length)?.insert).toBe("\n- ");
  });

  test("marker without trailing space is not a list", () => {
    expect(run("-item|")).toBeNull();
  });
});

function caretOf(line: string): number {
  return line.replace("|", "").length;
}
