// @vitest-environment happy-dom
import { describe, expect, test } from "vitest";
import { htmlToMarkdown } from "./htmlToMarkdown";

describe("htmlToMarkdown", () => {
  test("converts headings and paragraphs", () => {
    const markdown = htmlToMarkdown("<h1>标题</h1><p>第一段</p><h3>小标题</h3>");
    expect(markdown).toContain("# 标题");
    expect(markdown).toContain("第一段");
    expect(markdown).toContain("### 小标题");
  });

  test("converts inline styles", () => {
    const markdown = htmlToMarkdown(
      "<p><b>粗</b> 和 <em>斜</em> 和 <s>删</s> 和 <code>码</code></p>",
    );
    expect(markdown).toContain("**粗**");
    expect(markdown).toContain("*斜*");
    expect(markdown).toContain("~~删~~");
    expect(markdown).toContain("`码`");
  });

  test("converts links and skips anchors", () => {
    const markdown = htmlToMarkdown(
      '<p><a href="https://a.dev">站点</a><a href="#top">回顶</a></p>',
    );
    expect(markdown).toContain("[站点](https://a.dev)");
    expect(markdown).toContain("回顶");
    expect(markdown).not.toContain("[回顶](");
  });

  test("converts code blocks preserving newlines", () => {
    const markdown = htmlToMarkdown("<pre><code>const a = 1;\nconst b = 2;</code></pre>");
    expect(markdown).toContain("```\nconst a = 1;\nconst b = 2;\n```");
  });

  test("converts nested lists with indentation", () => {
    const markdown = htmlToMarkdown("<ul><li>外层<ul><li>内层</li></ul></li><li>第二项</li></ul>");
    expect(markdown).toContain("- 外层");
    expect(markdown).toMatch(/\n {2}- 内层/);
    expect(markdown).toContain("- 第二项");
  });

  test("converts ordered lists", () => {
    const markdown = htmlToMarkdown("<ol><li>一</li><li>二</li></ol>");
    expect(markdown).toContain("1. 一");
    expect(markdown).toContain("2. 二");
  });

  test("converts blockquotes line by line", () => {
    const markdown = htmlToMarkdown("<blockquote><p>第一行</p><p>第二行</p></blockquote>");
    expect(markdown).toContain("> 第一行");
    expect(markdown).toContain("> 第二行");
  });

  test("converts tables to GFM", () => {
    const markdown = htmlToMarkdown(
      "<table><tr><th>名</th><th>值</th></tr><tr><td>a</td><td>b|c</td></tr></table>",
    );
    expect(markdown).toContain("| 名 | 值 |");
    expect(markdown).toContain("| --- | --- |");
    expect(markdown).toContain("| a | b\\|c |");
  });

  test("converts hr and drops scripts and styles", () => {
    const markdown = htmlToMarkdown("<script>alert(1)</script><style>p{}</style><hr><p>正文</p>");
    expect(markdown).toContain("---");
    expect(markdown).toContain("正文");
    expect(markdown).not.toContain("alert");
    expect(markdown).not.toContain("p{}");
  });

  test("degrades data url images to alt text", () => {
    const markdown = htmlToMarkdown('<p><img src="data:image/png;base64,xxx" alt="占位"></p>');
    expect(markdown).toContain("占位");
    expect(markdown).not.toContain("data:");
  });

  test("flattens span wrappers and collapses extra blank lines", () => {
    const markdown = htmlToMarkdown('<div><span style="color:red">红字</span></div><p>之后</p>');
    expect(markdown).toContain("红字");
    expect(markdown).not.toMatch(/\n{3,}/);
  });
});
