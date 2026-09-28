const HEADINGS: Record<string, number> = { H1: 1, H2: 2, H3: 3, H4: 4, H5: 5, H6: 6 };

/** 这些标签内的内容直接丢弃（装饰性/不可转换） */
const DROP_SELECTOR = "script, style, meta, link, title, head, noscript, iframe, svg";

/** 容器标签：无对应 markdown 结构，递归展开子节点 */
const CONTAINER_TAGS = new Set([
  "DIV",
  "SECTION",
  "ARTICLE",
  "MAIN",
  "HEADER",
  "FOOTER",
  "NAV",
  "ASIDE",
  "FIGURE",
  "FIGCAPTION",
  "CENTER",
  "DETAILS",
  "SUMMARY",
]);

/** 视为块级子节点的标签（决定 li/容器/未知标签的转换路径） */
const BLOCK_TAGS = new Set([
  "P",
  "DIV",
  "UL",
  "OL",
  "BLOCKQUOTE",
  "PRE",
  "TABLE",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HR",
  "SECTION",
  "ARTICLE",
]);

/** li 内作为嵌套块处理的标签（其余子节点并入行内文本） */
const NESTED_BLOCK_TAGS = new Set(["UL", "OL", "BLOCKQUOTE", "PRE", "TABLE", "P", "DIV"]);

function inlineText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? "").replace(/\s+/g, " ");
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as Element;
  const children = () => Array.from(el.childNodes).map(inlineText).join("");
  switch (el.tagName) {
    case "BR":
      return "\n";
    case "B":
    case "STRONG": {
      const inner = children().trim();
      return inner ? `**${inner}**` : "";
    }
    case "I":
    case "EM": {
      const inner = children().trim();
      return inner ? `*${inner}*` : "";
    }
    case "DEL":
    case "S":
    case "STRIKE": {
      const inner = children().trim();
      return inner ? `~~${inner}~~` : "";
    }
    case "CODE": {
      const inner = children();
      // pre 内的 code 由 PRE 分支整体处理；行内 code 的反引号替换为单引号避免破坏围栏
      if (el.parentElement?.tagName === "PRE") return inner;
      return inner.trim() ? `\`${inner.trim().replace(/`/g, "'")}\`` : "";
    }
    case "A": {
      const href = el.getAttribute("href") ?? "";
      const inner = children().trim();
      if (!inner) return "";
      if (!href || href.startsWith("#") || href.toLowerCase().startsWith("javascript:")) {
        return inner;
      }
      return `[${inner}](${href})`;
    }
    case "IMG": {
      const src = el.getAttribute("src") ?? "";
      const alt = el.getAttribute("alt") ?? "";
      if (!src || src.startsWith("data:")) return alt;
      return `![${alt}](${src})`;
    }
    default:
      return children();
  }
}

function blockFromInline(text: string): string {
  const trimmed = text.trim();
  return trimmed ? `\n\n${trimmed}\n\n` : "";
}

function hasBlockChild(el: Element): boolean {
  return Array.from(el.children).some((child) => BLOCK_TAGS.has(child.tagName));
}

function convertList(listEl: Element, ordered: boolean, indent: string): string {
  const lines: string[] = [];
  let index = 1;
  for (const li of Array.from(listEl.children)) {
    if (li.tagName !== "LI") continue;
    let text = "";
    let nested = "";
    for (const child of Array.from(li.childNodes)) {
      const isElement = child.nodeType === Node.ELEMENT_NODE;
      const tag = isElement ? (child as Element).tagName : "";
      if (isElement && NESTED_BLOCK_TAGS.has(tag)) {
        nested += convertBlockNode(child, `${indent}  `);
      } else {
        text += inlineText(child);
      }
    }
    const marker = ordered ? `${index}. ` : "- ";
    index += 1;
    const collapsed = text.trim().replace(/\s*\n\s*/g, " ");
    const nestedBlock = nested.replace(/^\n+/, "").replace(/\n+$/, "");
    lines.push(`${indent}${marker}${collapsed}${nestedBlock ? `\n${nestedBlock}` : ""}`);
  }
  return lines.length ? `\n\n${lines.join("\n")}\n\n` : "";
}

function convertTable(table: Element): string {
  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length === 0) return "";
  const cellsOf = (tr: Element) =>
    Array.from(tr.children)
      .filter((cell) => cell.tagName === "TD" || cell.tagName === "TH")
      .map((cell) => inlineText(cell).trim().replace(/\|/g, "\\|").replace(/\n/g, " ") || " ");
  const header = cellsOf(rows[0]);
  const width = Math.max(header.length, 1);
  const pad = (cells: string[]) => {
    while (cells.length < width) cells.push(" ");
    return cells;
  };
  const body = rows.slice(1).map(cellsOf);
  const lines = [
    `| ${pad(header).join(" | ")} |`,
    `| ${Array.from({ length: width }, () => "---").join(" | ")} |`,
    ...body.map((cells) => `| ${pad(cells).join(" | ")} |`),
  ];
  return `\n\n${lines.join("\n")}\n\n`;
}

function convertBlockNode(node: Node, listIndent: string): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return blockFromInline(node.textContent ?? "");
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as Element;
  const tag = el.tagName;

  if (HEADINGS[tag]) {
    return blockFromInline(`${"#".repeat(HEADINGS[tag])} ${inlineText(el).trim()}`);
  }

  switch (tag) {
    case "P":
      return blockFromInline(inlineText(el));
    case "PRE": {
      // 代码块保留原始文本（不做空白折叠），去掉首尾多余空行
      const code = (el.textContent ?? "").replace(/^\n+|\n+$/g, "");
      return `\n\n\`\`\`\n${code}\n\`\`\`\n\n`;
    }
    case "HR":
      return "\n\n---\n\n";
    case "UL":
      return convertList(el, false, listIndent);
    case "OL":
      return convertList(el, true, listIndent);
    case "BLOCKQUOTE": {
      const inner = Array.from(el.childNodes)
        .map((child) => convertBlockNode(child, listIndent))
        .join("")
        .trim();
      if (!inner) return "";
      return `\n\n${inner
        .split("\n")
        .map((line) => `> ${line}`.trimEnd())
        .join("\n")}\n\n`;
    }
    case "TABLE":
      return convertTable(el);
    default: {
      if (CONTAINER_TAGS.has(tag) || hasBlockChild(el)) {
        return Array.from(el.childNodes)
          .map((child) => convertBlockNode(child, listIndent))
          .join("");
      }
      return blockFromInline(inlineText(el));
    }
  }
}

/**
 * 富文本 HTML → Markdown（DOM 树遍历实现，不引第三方依赖）。
 * 覆盖：标题/段落、加粗/斜体/删除线/行内代码、代码块、链接、图片、
 * 嵌套列表、引用、水平线、GFM 表格。丢弃脚本与样式，data: 图片降级为 alt 文本。
 * 转换失败时抛出异常，由调用方回落到纯文本粘贴。
 */
export function htmlToMarkdown(html: string): string {
  if (typeof DOMParser === "undefined") {
    throw new Error("DOMParser is unavailable");
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  for (const el of Array.from(doc.querySelectorAll(DROP_SELECTOR))) {
    el.remove();
  }
  const markdown = Array.from(doc.body.childNodes)
    .map((node) => convertBlockNode(node, ""))
    .join("");
  return markdown.replace(/\n{3,}/g, "\n\n").trim();
}
