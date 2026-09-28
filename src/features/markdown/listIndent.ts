export interface ListIndentResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

const QUOTE_PREFIX = /^[ \t]*>[ \t]?/;
const LIST_CONTENT = /^[ \t]*([-*+]|\d{1,9}[.)])[ \t]/;

function isListLine(line: string): boolean {
  const quote = QUOTE_PREFIX.exec(line);
  return LIST_CONTENT.test(quote ? line.slice(quote[0].length) : line);
}

/** 行内列表内容的起点（引用前缀之后）；缩进只作用于内容区，不破坏 "> " 前缀 */
function contentStartOf(line: string): number {
  const quote = QUOTE_PREFIX.exec(line);
  return quote ? quote[0].length : 0;
}

/** 选区覆盖的行区间；光标停在行首时该行不计入 */
function selectedLineRanges(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): Array<[number, number]> {
  const firstStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  let lastEnd: number;
  if (selectionStart === selectionEnd) {
    lastEnd = value.indexOf("\n", selectionStart);
    lastEnd = lastEnd === -1 ? value.length : lastEnd;
  } else {
    const endLineStart = value.lastIndexOf("\n", selectionEnd - 1) + 1;
    if (selectionEnd === endLineStart) {
      // 终点恰好落在某行行首：该行不算入选区
      lastEnd = selectionEnd - 1;
    } else {
      lastEnd = value.indexOf("\n", selectionEnd);
      lastEnd = lastEnd === -1 ? value.length : lastEnd;
    }
  }

  const ranges: Array<[number, number]> = [];
  let pos = firstStart;
  while (pos <= lastEnd) {
    const nl = value.indexOf("\n", pos);
    const end = nl === -1 ? value.length : nl;
    ranges.push([pos, end]);
    if (nl === -1 || end >= lastEnd) break;
    pos = nl + 1;
  }
  return ranges;
}

/**
 * 列表感知的 Tab 缩进：对选区覆盖的列表行（含 "> - " 引用内列表）整体加深一层，
 * 非列表行不动。没有任何列表行被缩进时返回 null，由调用方回落到通用缩进。
 */
export function listTabIndent(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  indentUnit: string,
): ListIndentResult | null {
  const ranges = selectedLineRanges(value, selectionStart, selectionEnd);
  const parts: string[] = [];
  const deltas: Array<{ position: number; delta: number }> = [];
  let prev = 0;
  let changed = false;

  for (const [start, end] of ranges) {
    const line = value.slice(start, end);
    if (!isListLine(line)) continue;
    const insertAt = start + contentStartOf(line);
    parts.push(value.slice(prev, insertAt), indentUnit);
    deltas.push({ position: insertAt, delta: indentUnit.length });
    prev = insertAt;
    changed = true;
  }
  if (!changed) return null;
  parts.push(value.slice(prev));

  return {
    value: parts.join(""),
    selectionStart: selectionStart + sumDeltasBelow(deltas, selectionStart),
    selectionEnd: selectionEnd + sumDeltasBelow(deltas, selectionEnd),
  };
}

/**
 * 列表感知的 Shift+Tab 反缩进：每个列表行去掉一层缩进（优先按缩进单位宽度，
 * 不足时去掉全部前导空格或一个 Tab）。没有任何变化时返回 null。
 */
export function listTabOutdent(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  indentUnit: string,
): ListIndentResult | null {
  const ranges = selectedLineRanges(value, selectionStart, selectionEnd);
  const unit = indentUnit.length;
  const parts: string[] = [];
  const deltas: Array<{ position: number; delta: number }> = [];
  let prev = 0;
  let changed = false;

  for (const [start, end] of ranges) {
    const line = value.slice(start, end);
    if (!isListLine(line)) continue;
    const contentAt = start + contentStartOf(line);
    const content = value.slice(contentAt, end);
    let removed = 0;
    if (content.startsWith("\t")) {
      removed = 1;
    } else {
      const spaces = /^ +/.exec(content)?.[0].length ?? 0;
      if (spaces === 0) continue;
      removed = Math.min(spaces, unit);
    }
    parts.push(value.slice(prev, contentAt));
    deltas.push({ position: contentAt, delta: -removed });
    prev = contentAt + removed;
    changed = true;
  }
  if (!changed) return null;
  parts.push(value.slice(prev));

  return {
    value: parts.join(""),
    selectionStart: selectionStart + sumDeltasBelow(deltas, selectionStart),
    selectionEnd: selectionEnd + sumDeltasBelow(deltas, selectionEnd),
  };
}

/** 统计位于 position 之前（含该处）的插入偏移累计值，用于修正选区 */
function sumDeltasBelow(
  deltas: Array<{ position: number; delta: number }>,
  position: number,
): number {
  let total = 0;
  for (const { position: at, delta } of deltas) {
    if (at <= position) total += delta;
  }
  return total;
}

/**
 * 通用缩进回落（行为与 indent-textarea 一致）：光标态直接在光标处插入/删除缩进，
 * 多行选区逐行增/减一层。供非列表行使用，使 Tab 始终由编辑器组件接管而非移动焦点。
 */
export function genericTextIndent(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  indentUnit: string,
  outdent: boolean,
): ListIndentResult {
  if (!outdent && selectionStart === selectionEnd) {
    const next = value.slice(0, selectionStart) + indentUnit + value.slice(selectionStart);
    return {
      value: next,
      selectionStart: selectionStart + indentUnit.length,
      selectionEnd: selectionStart + indentUnit.length,
    };
  }

  const ranges = selectedLineRanges(value, selectionStart, selectionEnd);
  const unit = indentUnit.length;
  const parts: string[] = [];
  const deltas: Array<{ position: number; delta: number }> = [];
  let prev = 0;

  for (const [start, end] of ranges) {
    if (!outdent) {
      parts.push(value.slice(prev, start), indentUnit);
      deltas.push({ position: start, delta: indentUnit.length });
      prev = start;
      continue;
    }
    const leading = /^[ \t]+/.exec(value.slice(start, end))?.[0] ?? "";
    const removed = leading.startsWith("\t") ? 1 : Math.min(leading.length, unit);
    if (removed > 0) {
      parts.push(value.slice(prev, start));
      deltas.push({ position: start, delta: -removed });
      prev = start + removed;
    }
  }
  parts.push(value.slice(prev));

  let nextStart = selectionStart;
  let nextEnd = selectionEnd;
  for (const { position, delta } of deltas) {
    if (position <= selectionStart) nextStart += delta;
    if (position <= selectionEnd) nextEnd += delta;
  }
  return {
    value: parts.join(""),
    selectionStart: Math.max(0, nextStart),
    selectionEnd: Math.max(0, nextEnd),
  };
}
