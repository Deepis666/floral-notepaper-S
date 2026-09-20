export interface HrInsertion {
  result: string;
  cursor: number;
}

// `---` 紧邻正文行时会被 Markdown 解析为 setext 标题（把上一行升为 H2），
// 只有分割线前后都有空行才会渲染成水平线。这里按需补足空行：
// 已有空行不重复添加，光标处原本只有一个换行时再补一个。
export function buildHrInsertion(value: string, start: number, end: number): HrInsertion {
  const before = value.slice(0, start);
  const after = value.slice(end);

  let gapBefore = "";
  if (before !== "" && !before.endsWith("\n\n")) {
    gapBefore = before.endsWith("\n") ? "\n" : "\n\n";
  }

  let gapAfter = "";
  if (after !== "" && !after.startsWith("\n\n")) {
    gapAfter = after.startsWith("\n") ? "\n" : "\n\n";
  }

  return {
    result: `${before}${gapBefore}---${gapAfter}${after}`,
    cursor: before.length + gapBefore.length + 3,
  };
}
