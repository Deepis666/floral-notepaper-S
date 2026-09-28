import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { MarkdownPreview } from "./MarkdownPreview";

vi.mock("@tauri-apps/plugin-opener", () => ({
  openUrl: vi.fn(),
}));

describe("MarkdownPreview", () => {
  test("marks rendered Markdown content as selectable", () => {
    const markup = renderToStaticMarkup(<MarkdownPreview content="# 花笺\n\n正文" />);

    expect(markup).toContain("markdown-selectable");
    expect(markup).toContain("<h1");
    expect(markup).toContain("花笺");
    expect(markup).toContain("正文");
  });

  test("keeps code block controls outside the horizontally scrollable pre", () => {
    const markup = renderToStaticMarkup(
      <MarkdownPreview content={"```text\nvery long code line\n```"} />,
    );

    const preCloseIndex = markup.indexOf("</pre>");
    const buttonIndex = markup.indexOf("<button");

    expect(markup).toContain("markdown-code-block");
    expect(markup).toContain("markdown-code-scroll");
    expect(preCloseIndex).toBeGreaterThan(-1);
    expect(buttonIndex).toBeGreaterThan(preCloseIndex);
  });

  test("highlights fenced code blocks with hljs token classes", () => {
    const markup = renderToStaticMarkup(
      <MarkdownPreview content={"```js\nconst answer = 42;\n```"} />,
    );

    expect(markup).toContain("hljs-keyword");
    expect(markup).toContain("hljs-number");
  });

  test("renders code blocks without a language as plain text", () => {
    const markup = renderToStaticMarkup(<MarkdownPreview content={"```\nplain text\n```"} />);

    expect(markup).not.toContain("hljs-keyword");
    expect(markup).toContain("plain text");
  });

  test("renders mermaid blocks as source instead of highlighted code", () => {
    const markup = renderToStaticMarkup(
      <MarkdownPreview content={"```mermaid\ngraph TD\n A-->B\n```"} />,
    );

    expect(markup).toContain("graph TD");
    expect(markup).not.toContain("hljs-");
  });
});
