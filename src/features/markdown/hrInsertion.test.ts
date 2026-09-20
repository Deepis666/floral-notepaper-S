import { describe, expect, it } from "vitest";
import { buildHrInsertion } from "./hrInsertion";

describe("buildHrInsertion", () => {
  it("在空文档中只插入分割线本身", () => {
    const insertion = buildHrInsertion("", 0, 0);
    expect(insertion.result).toBe("---");
    expect(insertion.cursor).toBe(3);
  });

  it("光标紧贴正文末尾时补足空行，避免 --- 被解析为 setext 标题", () => {
    const insertion = buildHrInsertion("你好世界", 4, 4);
    expect(insertion.result).toBe("你好世界\n\n---");
    expect(insertion.cursor).toBe(4 + 2 + 3);
  });

  it("光标在行尾、后文以换行开头时合成一个空行", () => {
    const insertion = buildHrInsertion("第一段\n第二段", 3, 3);
    expect(insertion.result).toBe("第一段\n\n---\n\n第二段");
    expect(insertion.cursor).toBe(3 + 2 + 3);
  });

  it("前后已有空行时不重复添加", () => {
    const value = "上文\n\n下文";
    const insertion = buildHrInsertion(value, 4, 4);
    expect(insertion.result).toBe("上文\n\n---\n\n下文");
    expect(insertion.cursor).toBe(4 + 0 + 3);
  });

  it("存在选中文本时分割线替换选区（与其余工具栏按钮一致的取值口径）", () => {
    const insertion = buildHrInsertion("ABxxCD", 2, 4);
    expect(insertion.result).toBe("AB\n\n---\n\nCD");
    expect(insertion.cursor).toBe(2 + 2 + 3);
  });

  it("光标在文档开头时后方补空行", () => {
    const insertion = buildHrInsertion("正文", 0, 0);
    expect(insertion.result).toBe("---\n\n正文");
    expect(insertion.cursor).toBe(3);
  });
});
