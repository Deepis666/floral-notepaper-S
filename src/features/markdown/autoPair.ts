export interface AutoPairEdit {
  /** 应用后的完整文本；type-over（跳过已有闭合符）时与原值相同 */
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/** 有选区时按下这些键会包裹选中文本：键 → [前缀, 闭合串] */
const SELECTION_WRAPPERS: Record<string, [string, string]> = {
  "*": ["*", "*"],
  _: ["_", "_"],
  "`": ["`", "`"],
  $: ["$", "$"],
  "~": ["~~", "~~"],
  "=": ["==", "=="],
  "[": ["[", "]"],
  "(": ["(", ")"],
};

/** 空光标时自动补全成对的键：键 → 闭合字符。仅限无歧义的 Markdown 语法字符，
 *  $ 与 * 等普通文本常见字符不参与，避免 "价格 $100" 一类内容被破坏 */
const CARET_PAIRS: Record<string, string> = {
  "`": "`",
  "[": "]",
  "(": ")",
};

/** 这些闭合字符已存在于光标处时，再按一次直接跳过而不是重复插入 */
const TYPE_OVER_KEYS = new Set(["]", ")", "`", "$"]);

/**
 * Markdown 自动配对与包裹：
 * - 有选区：* _ ` $ ~ = [ ( 包裹选中文本（== 与 ~~ 由单键触发，直接生成双符号围栏）
 * - 空光标：` [ ( 生成成对符号光标居中；词字符旁不配对，防止 "a[b]" 类文本被破坏
 * - 已有闭合符在光标处：按闭合键直接越过（type-over）
 */
export function autoPair(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  key: string,
): AutoPairEdit | null {
  if (selectionStart !== selectionEnd) {
    const [open, close] = SELECTION_WRAPPERS[key] ?? [null, null];
    if (!open || !close) return null;
    const selected = value.slice(selectionStart, selectionEnd);
    const next =
      value.slice(0, selectionStart) + open + selected + close + value.slice(selectionEnd);
    return {
      value: next,
      selectionStart: selectionStart + open.length,
      selectionEnd: selectionStart + open.length + selected.length,
    };
  }

  if (TYPE_OVER_KEYS.has(key) && value[selectionStart] === key) {
    return { value, selectionStart: selectionStart + 1, selectionEnd: selectionStart + 1 };
  }

  const close = CARET_PAIRS[key];
  if (!close) return null;
  const prev = selectionStart > 0 ? value[selectionStart - 1] : "";
  const nextChar = value[selectionStart] ?? "";
  if (/[\w`$]/.test(prev) || /\w/.test(nextChar)) return null;
  const next = value.slice(0, selectionStart) + key + close + value.slice(selectionStart);
  return { value: next, selectionStart: selectionStart + 1, selectionEnd: selectionStart + 1 };
}
