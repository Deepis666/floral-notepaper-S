export interface ListContinuation {
  /** 需替换的原文区间；续行时 start === end（光标处插入），退出列表/引用时删除行首前缀 */
  replaceStart: number;
  replaceEnd: number;
  insert: string;
}

// 缩进 | marker（无序或有序）| marker 后空隙 | 可选 task 勾选框 | 剩余内容
const LIST_MARKER = /^([ \t]*)([-*+]|\d{1,9}[.)])([ \t]+)(\[[ xX]\][ \t]+)?(.*)$/;
const QUOTE_PREFIX = /^[ \t]*>[ \t]?/;

/** 光标所在行之前是否处于未闭合的围栏代码块（``` 或 ~~~）内 */
function insideUnclosedFence(linesBeforeCaret: string[]): boolean {
  let openFences = 0;
  for (const line of linesBeforeCaret) {
    if (/^\s*(```|~~~)/.test(line)) openFences += 1;
  }
  return openFences % 2 === 1;
}

/**
 * 回车时的列表/引用智能续行（Typora 行为）：
 * - 列表项（无序/有序/task，含 "> - " 引用内列表）回车带出下一项 marker，
 *   有序号码 +1，task 延续为未勾选
 * - 引用行回车延续 "> "
 * - 空列表项/空引用行回车 = 删除行首前缀退出
 * - 光标在围栏代码块内、非列表行时不干预（返回 null 交还原生行为）
 * 调用方须保证 selectionStart === selectionEnd。
 */
export function listContinuation(value: string, caret: number): ListContinuation | null {
  const lineStart = value.lastIndexOf("\n", caret - 1) + 1;
  const newlineAfter = value.indexOf("\n", caret);
  const lineEnd = newlineAfter === -1 ? value.length : newlineAfter;
  const fullLine = value.slice(lineStart, lineEnd);

  if (insideUnclosedFence(value.slice(0, lineStart).split("\n"))) return null;

  const quoteMatch = QUOTE_PREFIX.exec(fullLine);
  const quotePrefix = quoteMatch ? quoteMatch[0] : "";
  const restStart = lineStart + quotePrefix.length;
  const restLine = fullLine.slice(quotePrefix.length);

  const listMatch = LIST_MARKER.exec(restLine);

  if (!quoteMatch && !listMatch) return null;

  const markerEnd =
    restStart +
    (listMatch
      ? listMatch[1].length +
        listMatch[2].length +
        listMatch[3].length +
        (listMatch[4]?.length ?? 0)
      : 0);
  const contentBeforeCaret = value.slice(markerEnd, caret).trim();
  const contentAfterCaret = value.slice(caret, lineEnd).trim();

  // 空列表项/空引用行（前缀后无内容）回车 = 删除前缀退出
  if (contentBeforeCaret === "" && contentAfterCaret === "") {
    return { replaceStart: lineStart, replaceEnd: caret, insert: "" };
  }

  if (listMatch) {
    const [, indent, marker, , taskBlock] = listMatch;
    const orderedMatch = /^(\d{1,9})([.)])$/.exec(marker);
    const nextMarker = orderedMatch
      ? `${Number.parseInt(orderedMatch[1], 10) + 1}${orderedMatch[2]}`
      : marker;
    const taskSuffix = taskBlock ? "[ ] " : "";
    return {
      replaceStart: caret,
      replaceEnd: caret,
      insert: `\n${quotePrefix}${indent}${nextMarker} ${taskSuffix}`,
    };
  }

  // 纯引用续行
  const normalizedPrefix = /[ \t]$/.test(quotePrefix) ? quotePrefix : `${quotePrefix} `;
  return { replaceStart: caret, replaceEnd: caret, insert: `\n${normalizedPrefix}` };
}
