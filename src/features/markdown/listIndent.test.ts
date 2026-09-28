import { describe, expect, test } from "vitest";
import { listTabIndent, listTabOutdent } from "./listIndent";

describe("listTabIndent", () => {
  test("indents the caret-only list line by the unit", () => {
    const result = listTabIndent("- item", 3, 3, "  ");
    expect(result?.value).toBe("  - item");
    expect(result?.selectionStart).toBe(5);
  });

  test("returns null for non-list lines", () => {
    expect(listTabIndent("hello", 2, 2, "  ")).toBeNull();
  });

  test("indents ordered and task lines", () => {
    expect(listTabIndent("1. a", 4, 4, "  ")?.value).toBe("  1. a");
    expect(listTabIndent("- [ ] x", 6, 6, "  ")?.value).toBe("  - [ ] x");
  });

  test("indents all selected list lines and keeps selection proportional", () => {
    const value = "- a\n- b\ntext";
    // 选中第 1~2 行
    const result = listTabIndent(value, 0, 7, " ");
    expect(result?.value).toBe(" - a\n - b\ntext");
    expect(result?.selectionStart).toBe(1);
    expect(result?.selectionEnd).toBe(9);
  });

  test("leaves non-list lines within a multi-line selection untouched", () => {
    const value = "text\n- a\ntext";
    const result = listTabIndent(value, 0, 12, " ");
    expect(result?.value).toBe("text\n - a\ntext");
  });

  test("selection ending at a line start excludes that line", () => {
    const value = "- a\n- b";
    // 终点 4 恰在第二行行首 → 仅缩进第一行
    const result = listTabIndent(value, 0, 4, " ");
    expect(result?.value).toBe(" - a\n- b");
  });

  test("indents list content inside a quote without breaking the prefix", () => {
    const result = listTabIndent("> - a", 5, 5, "  ");
    expect(result?.value).toBe(">   - a");
  });
});

describe("listTabOutdent", () => {
  test("removes one indent level", () => {
    const result = listTabOutdent("  - item", 6, 6, "  ");
    expect(result?.value).toBe("- item");
    expect(result?.selectionStart).toBe(4);
  });

  test("removes a full tab", () => {
    expect(listTabOutdent("\t- a", 4, 4, "  ")?.value).toBe("- a");
  });

  test("removes fewer spaces than the unit when that is all there is", () => {
    expect(listTabOutdent(" - a", 4, 4, "  ")?.value).toBe("- a");
  });

  test("returns null when there is nothing to remove", () => {
    expect(listTabOutdent("- a", 3, 3, "  ")).toBeNull();
    expect(listTabOutdent("text", 2, 2, "  ")).toBeNull();
  });

  test("outdents only list lines within a selection", () => {
    const value = "  - a\ntext\n    - b";
    const result = listTabOutdent(value, 0, 17, "  ");
    expect(result?.value).toBe("- a\ntext\n  - b");
  });

  test("works inside a quote", () => {
    expect(listTabOutdent(">   - a", 7, 7, "  ")?.value).toBe("> - a");
  });
});
