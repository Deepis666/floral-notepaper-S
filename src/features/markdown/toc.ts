export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

/** 预览栏窄于此宽度时隐藏大纲面板，避免遮挡正文 */
export const TOC_MIN_PANE_WIDTH = 620;

interface HeadingLike {
  id: string | null;
  tagName: string;
  textContent: string | null;
}

/** 从渲染后的标题元素（h1-h6）提取大纲条目；无 id 的标题不可锚定，跳过 */
export function tocEntriesFromHeadings(headings: HeadingLike[]): TocEntry[] {
  const entries: TocEntry[] = [];
  for (const heading of headings) {
    if (!heading.id) continue;
    const level = Number.parseInt(heading.tagName.slice(1), 10);
    if (!Number.isInteger(level) || level < 1 || level > 6) continue;
    const text = (heading.textContent ?? "").trim();
    if (!text) continue;
    entries.push({ id: heading.id, text, level });
  }
  return entries;
}

/**
 * 滚动位置对应的当前章节：取最后一个“顶边已越过滚动线（scrollTop + tolerance）”
 * 的标题；都在滚动线下方时返回 -1（尚在首章之前的空档）。
 * offsets 需与条目同序且按文档顺序递增。
 */
export function findActiveHeadingIndex(
  offsets: number[],
  scrollTop: number,
  tolerance = 96,
): number {
  let active = -1;
  for (let index = 0; index < offsets.length; index += 1) {
    if (offsets[index] <= scrollTop + tolerance) {
      active = index;
    } else {
      break;
    }
  }
  return active;
}
