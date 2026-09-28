import { describe, expect, test } from "vitest";
import { autoPair } from "./autoPair";

describe("autoPair — selection wrapping", () => {
  test.each([
    ["*", "*text*", 1],
    ["_", "_text_", 1],
    ["`", "`text`", 1],
    ["$", "$text$", 1],
    ["~", "~~text~~", 2],
    ["=", "==text==", 2],
    ["[", "[text]", 1],
    ["(", "(text)", 1],
  ])("wraps selection with %s", (key, expected, openLength) => {
    const result = autoPair("text", 0, 4, key);
    expect(result?.value).toBe(expected);
    expect(result?.selectionStart).toBe(openLength);
    expect(result?.selectionEnd).toBe(openLength + 4);
  });
});

describe("autoPair — empty caret pairing", () => {
  test.each([
    ["`", "`|`"],
    ["[", "[|]"],
    ["(", "(|)"],
  ])("pairs %s with cursor inside", (key, expected) => {
    const result = autoPair("", 0, 0, key);
    expect(result?.value).toBe(expected.replace("|", ""));
    expect(result?.selectionStart).toBe(1);
    expect(result?.selectionEnd).toBe(1);
  });

  test("does not pair word-adjacent characters", () => {
    expect(autoPair("a", 1, 1, "[")).toBeNull();
    expect(autoPair("cost ", 5, 5, "$")).toBeNull();
    expect(autoPair("", 0, 0, "[")).not.toBeNull();
  });

  test("does not pair when followed by a word character", () => {
    expect(autoPair("abc", 0, 0, "(")).toBeNull();
  });

  test("does not pair common text characters at caret", () => {
    expect(autoPair("", 0, 0, "*")).toBeNull();
    expect(autoPair("", 0, 0, "=")).toBeNull();
    expect(autoPair("", 0, 0, "~")).toBeNull();
    expect(autoPair("cost ", 5, 5, "$")).toBeNull();
  });

  test("does not pair common text characters at caret", () => {
    expect(autoPair("", 0, 0, "*")).toBeNull();
    expect(autoPair("", 0, 0, "=")).toBeNull();
    expect(autoPair("", 0, 0, "~")).toBeNull();
  });
});

describe("autoPair — type-over", () => {
  test.each([
    ["]", "a]b"],
    [")", "a)b"],
    ["`", "a`b"],
    ["$", "a$b"],
  ])("skips over existing close char %s", (key, value) => {
    const result = autoPair(value, 1, 1, key);
    expect(result?.value).toBe(value);
    expect(result?.selectionStart).toBe(2);
  });

  test("type-over does not trigger for a different char", () => {
    expect(autoPair("a]b", 1, 1, ")")).toBeNull();
  });
});
