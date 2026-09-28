export interface FindMatch {
  start: number;
  end: number;
}

/** 在文本中查找全部匹配位置（非重叠、按出现顺序）；空查询返回空数组 */
export function findRanges(value: string, query: string, caseSensitive: boolean): FindMatch[] {
  if (!query) return [];
  const haystack = caseSensitive ? value : value.toLowerCase();
  const needle = caseSensitive ? query : query.toLowerCase();
  const matches: FindMatch[] = [];
  let from = 0;
  while (from <= haystack.length - needle.length) {
    const index = haystack.indexOf(needle, from);
    if (index === -1) break;
    matches.push({ start: index, end: index + needle.length });
    from = index + needle.length;
  }
  return matches;
}

/** 全部替换：返回新文本与替换次数（替换串中含查询词时不会二次展开） */
export function replaceAllMatches(
  value: string,
  query: string,
  replacement: string,
  caseSensitive: boolean,
): { value: string; count: number } {
  const matches = findRanges(value, query, caseSensitive);
  if (matches.length === 0) return { value, count: 0 };
  let result = "";
  let prev = 0;
  for (const match of matches) {
    result += value.slice(prev, match.start) + replacement;
    prev = match.end;
  }
  result += value.slice(prev);
  return { value: result, count: matches.length };
}
