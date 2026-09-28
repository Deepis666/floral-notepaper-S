import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { findRanges, replaceAllMatches, type FindMatch } from "../features/markdown/findRanges";

interface FindBarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onDirty: () => void;
  onClose: () => void;
}

const iconButtonClass =
  "flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-[11px] text-ink-ghost transition hover:bg-paper-deep/40 hover:text-ink";

/**
 * 编辑区查找替换条：即输即搜、Enter/Shift+Enter 循环导航、区分大小写切换、
 * 单个/全部替换。全部替换走一次 execCommand，撤销为单步。
 */
export function FindBar({ textareaRef, value, onChange, onDirty, onClose }: FindBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [current, setCurrent] = useState(0);
  const findInputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(
    () => findRanges(value, query, caseSensitive),
    [value, query, caseSensitive],
  );
  // 替换/内容变化后匹配数可能变少，钳制当前序号避免越界
  const activeIndex = matches.length > 0 ? Math.min(current, matches.length - 1) : 0;

  // 查询或大小写开关变化时，将当前项重置为第一个匹配
  useEffect(() => {
    setCurrent(matches.length > 0 ? 0 : 0);
  }, [query, caseSensitive, matches.length]);

  useEffect(() => {
    findInputRef.current?.focus();
  }, []);

  const reveal = (match: FindMatch | undefined) => {
    const textarea = textareaRef.current;
    if (!textarea || !match) return;
    textarea.focus();
    // 先归零再定位，强制 WebView 将选区滚动到视野内
    textarea.setSelectionRange(0, 0);
    textarea.setSelectionRange(match.start, match.end);
  };

  const goto = (index: number) => {
    if (matches.length === 0) return;
    const next = ((index % matches.length) + matches.length) % matches.length;
    setCurrent(next);
    reveal(matches[next]);
  };

  const replaceAt = (match: FindMatch) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const nextValue = value.slice(0, match.start) + replacement + value.slice(match.end);
    textarea.focus();
    textarea.setSelectionRange(0, value.length);
    document.execCommand("insertText", false, nextValue);
    onChange(nextValue);
    onDirty();
  };

  const replaceCurrent = () => {
    if (matches.length === 0) return;
    // 替换后停在原序号：同位置重扫出的下一个匹配（替换文本含查询词时也正确推进）
    replaceAt(matches[activeIndex]);
  };

  const replaceEverything = () => {
    const { value: nextValue, count } = replaceAllMatches(value, query, replacement, caseSensitive);
    if (count === 0) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(0, value.length);
    document.execCommand("insertText", false, nextValue);
    onChange(nextValue);
    onDirty();
  };

  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      goto(event.shiftKey ? current - 1 : current + 1);
      return;
    }
  };

  return (
    <div className="flex shrink-0 flex-col gap-1.5 border-b border-paper-deep/20 bg-paper-warm/40 px-4 py-1.5">
      <div className="flex items-center gap-1">
        <input
          ref={findInputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKey}
          placeholder={t("main.find.searchPlaceholder", { defaultValue: "查找" })}
          className="h-6 min-w-0 flex-1 rounded border border-paper-deep/40 bg-paper px-2 text-xs text-ink-soft outline-none placeholder:text-ink-ghost/50 focus:border-bamboo/50"
        />
        <span className="w-14 shrink-0 text-center font-mono text-[10px] tabular-nums text-ink-ghost">
          {query
            ? matches.length > 0
              ? `${activeIndex + 1}/${matches.length}`
              : t("main.find.noMatch", { defaultValue: "无匹配" })
            : ""}
        </span>
        <button
          type="button"
          onClick={() => goto(activeIndex - 1)}
          title={t("main.find.prev", { defaultValue: "上一个（Shift+Enter）" })}
          className={iconButtonClass}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => goto(activeIndex + 1)}
          title={t("main.find.next", { defaultValue: "下一个（Enter）" })}
          className={iconButtonClass}
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => setCaseSensitive((value) => !value)}
          title={t("main.find.caseSensitive", { defaultValue: "区分大小写" })}
          className={`${iconButtonClass} font-mono text-[10px] ${
            caseSensitive ? "bg-bamboo/15 text-bamboo" : ""
          }`}
        >
          Aa
        </button>
        <button
          type="button"
          onClick={() => setShowReplace((value) => !value)}
          title={t("main.find.toggleReplace", { defaultValue: "展开替换" })}
          className={iconButtonClass}
        >
          ⇄
        </button>
        <button
          type="button"
          onClick={onClose}
          title={t("main.find.close", { defaultValue: "关闭（Esc）" })}
          className={iconButtonClass}
        >
          ×
        </button>
      </div>
      {showReplace && (
        <div className="flex items-center gap-1">
          <input
            value={replacement}
            onChange={(event) => setReplacement(event.target.value)}
            onKeyDown={handleKey}
            placeholder={t("main.find.replacePlaceholder", { defaultValue: "替换为" })}
            className="h-6 min-w-0 flex-1 rounded border border-paper-deep/40 bg-paper px-2 text-xs text-ink-soft outline-none placeholder:text-ink-ghost/50 focus:border-bamboo/50"
          />
          <button
            type="button"
            onClick={replaceCurrent}
            disabled={matches.length === 0}
            className="h-6 shrink-0 cursor-pointer rounded px-2 text-[11px] text-ink-soft transition hover:bg-paper-deep/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("main.find.replace", { defaultValue: "替换" })}
          </button>
          <button
            type="button"
            onClick={replaceEverything}
            disabled={matches.length === 0}
            className="h-6 shrink-0 cursor-pointer rounded px-2 text-[11px] text-ink-soft transition hover:bg-paper-deep/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("main.find.replaceAll", { defaultValue: "全部替换" })}
          </button>
        </div>
      )}
    </div>
  );
}
