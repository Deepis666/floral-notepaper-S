import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { MarkdownPreview } from "./MarkdownPreview";

vi.mock("@tauri-apps/plugin-opener", () => ({
  openUrl: vi.fn(),
}));

describe("MarkdownPreview mermaid wiring", () => {
  test("mermaid fence mounts MermaidBlock instead of CodeBlock", () => {
    const content = "```mermaid\ngraph TD\n  A-->B\n```";
    const markup = renderToStaticMarkup(<MarkdownPreview content={content} />);

    // MermaidBlock 的降级/加载态容器，说明语言识别命中并挂载了组件
    expect(markup).toContain("graph TD");
    expect(markup).not.toContain("markdown-code-block");
    expect(markup).not.toContain(">mermaid<");
  });

  test("non-mermaid fence still uses CodeBlock", () => {
    const markup = renderToStaticMarkup(<MarkdownPreview content={"```js\nconst a = 1;\n```"} />);

    expect(markup).toContain("markdown-code-block");
    expect(markup).toContain(">js<");
  });
});
