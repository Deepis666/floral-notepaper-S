import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Mermaid } from "mermaid";

// 懒加载单例：仅当笔记中出现 mermaid 代码块时才加载庞大的渲染引擎
let mermaidLoader: Promise<Mermaid> | null = null;

function loadMermaid(): Promise<Mermaid> {
  if (!mermaidLoader) {
    mermaidLoader = import("mermaid").then((module) => {
      module.default.initialize({ startOnLoad: false, suppressErrorRendering: true });
      return module.default;
    });
    // 加载失败时清空缓存，下次代码变化时可重试加载
    void mermaidLoader.catch(() => {
      mermaidLoader = null;
    });
  }
  return mermaidLoader;
}

export function mermaidLanguageFromClass(className?: string): string | null {
  const match = className?.match(/language-(\S+)/);
  return match ? match[1] : null;
}

export function isMermaidLanguage(language: string | null | undefined): boolean {
  return language === "mermaid";
}

export function mermaidThemeFromDataTheme(theme: string | null): "default" | "dark" {
  return theme === "dark" ? "dark" : "default";
}

let renderCounter = 0;

function MermaidFallback({ code, failed }: { code: string; failed: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="my-3">
      {failed && (
        <p className="mb-1 text-[0.85em] text-ink-ghost">
          {t("markdown.mermaidError", { defaultValue: "图表渲染失败，请检查 mermaid 语法" })}
        </p>
      )}
      <pre className="markdown-code-scroll m-0 px-4 py-3 rounded bg-paper-warm/80 overflow-x-auto">
        <code className="text-[0.85em] font-mono text-ink-soft leading-[1.8] whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

export function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [theme, setTheme] = useState<string | null>(() =>
    typeof document === "undefined" ? null : document.documentElement.getAttribute("data-theme"),
  );
  const baseId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(root.getAttribute("data-theme"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let ignore = false;
    setFailed(false);
    setSvg(null);
    // 编辑预览实时联动：防抖避免每次按键都重新渲染图表；
    // 模块加载失败时保持展示源码，避免误报为语法错误，
    // 仅 parse/render 失败才提示用户检查语法。
    const timer = window.setTimeout(() => {
      void (async () => {
        let mermaid: Mermaid;
        try {
          mermaid = await loadMermaid();
        } catch {
          // 模块加载失败：保持展示源码，不报语法错误，下次变更时重试
          return;
        }
        if (ignore) return;
        try {
          // 主题切换后用对应主题重新初始化，再渲染当前代码块
          mermaid.initialize({
            startOnLoad: false,
            suppressErrorRendering: true,
            theme: mermaidThemeFromDataTheme(theme),
          });
          const renderId = `mermaid-render-${(renderCounter += 1)}`;
          await mermaid.parse(code);
          const { svg: rendered, bindFunctions } = await mermaid.render(renderId, code);
          if (ignore) return;
          setSvg(rendered);
          bindFunctions?.(containerRef.current ?? document.body);
        } catch {
          if (!ignore) setFailed(true);
        }
      })();
    }, 300);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [code, theme]);

  const styledSvg = useMemo(
    () => (svg ? svg.replace(/^<svg/i, '<svg style="max-width:100%"') : null),
    [svg],
  );

  if (failed) return <MermaidFallback code={code} failed />;
  if (!styledSvg) return <MermaidFallback code={code} failed={false} />;

  return (
    <div
      ref={containerRef}
      id={baseId}
      className="my-3 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: styledSvg }}
    />
  );
}
