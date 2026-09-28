import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  findActiveHeadingIndex,
  TOC_MIN_PANE_WIDTH,
  tocEntriesFromHeadings,
  type TocEntry,
} from "../features/markdown/toc";

interface TocPanelProps {
  /** 预览滚动容器；标题条目与偏移均从其内部 DOM 扫描，保证与 rehype-slug 的锚点一致 */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * 预览区浮动大纲面板：点击标题滚动定位、滚动时高亮当前章节、可折叠，
 * 预览栏过窄时自动隐藏。条目从渲染后的 DOM 扫描，随内容变化增量重建。
 */
export function TocPanel({ containerRef }: TocPanelProps) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [paneWidth, setPaneWidth] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const offsetsRef = useRef<number[]>([]);
  const rescanTimer = useRef<number>(0);

  const scan = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const headings = Array.from(container.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"));
    const nextEntries = tocEntriesFromHeadings(headings);
    const containerRect = container.getBoundingClientRect();
    setEntries(nextEntries);
    offsetsRef.current = nextEntries.map((entry) => {
      const element = container.querySelector<HTMLElement>(`#${CSS.escape(entry.id)}`);
      if (!element) return 0;
      return element.getBoundingClientRect().top - containerRect.top + container.scrollTop;
    });
  }, [containerRef]);

  // 内容变化后重扫：MutationObserver 捕获 MarkdownPreview 的重渲染（含懒加载首次挂载）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    scan();
    const observer = new MutationObserver(() => {
      window.clearTimeout(rescanTimer.current);
      rescanTimer.current = window.setTimeout(scan, 200);
    });
    observer.observe(container, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      window.clearTimeout(rescanTimer.current);
    };
  }, [scan, containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => setPaneWidth(container.clientWidth));
    observer.observe(container);
    setPaneWidth(container.clientWidth);
    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () =>
      setActiveIndex(findActiveHeadingIndex(offsetsRef.current, container.scrollTop));
    update();
    container.addEventListener("scroll", update, { passive: true });
    return () => container.removeEventListener("scroll", update);
  }, [containerRef, entries]);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        title={t("main.editor.outline", { defaultValue: "大纲" })}
        aria-label={t("main.editor.outline", { defaultValue: "大纲" })}
        className="absolute top-3 right-3 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-paper-deep/40 bg-paper/90 text-ink-faint shadow-sm backdrop-blur transition hover:text-ink"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className="h-3.5 w-3.5"
        >
          <path d="M2.5 4h11M4.5 8h9M6.5 12h7" strokeLinecap="round" />
        </svg>
      </button>
    );
  }

  if (entries.length === 0 || (paneWidth > 0 && paneWidth < TOC_MIN_PANE_WIDTH)) {
    return null;
  }

  return (
    <nav
      aria-label={t("main.editor.outline", { defaultValue: "大纲" })}
      className="absolute top-3 right-3 z-10 flex max-h-[calc(100%-1.5rem)] w-48 flex-col rounded-lg border border-paper-deep/40 bg-paper/90 shadow-sm backdrop-blur"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-paper-deep/30 px-3 py-1.5">
        <span className="font-mono text-[10px] tracking-widest text-ink-ghost/60 uppercase">
          {t("main.editor.outline", { defaultValue: "大纲" })}
        </span>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label={t("main.editor.outline", { defaultValue: "大纲" })}
          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-ink-ghost transition hover:bg-paper-deep/40 hover:text-ink"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="h-3 w-3"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto py-1">
        {entries.map((entry, index) => (
          <button
            key={`${entry.id}-${index}`}
            type="button"
            onClick={() => {
              const heading = containerRef.current?.querySelector<HTMLElement>(
                `#${CSS.escape(entry.id)}`,
              );
              heading?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            title={entry.text}
            className={`block w-full cursor-pointer truncate px-3 py-1 text-left text-[11px] leading-snug transition-colors ${
              index === activeIndex
                ? "font-medium text-bamboo"
                : "text-ink-faint hover:text-ink-soft"
            }`}
            style={{ paddingLeft: `${12 + (entry.level - 1) * 10}px` }}
          >
            {entry.text}
          </button>
        ))}
      </div>
    </nav>
  );
}
