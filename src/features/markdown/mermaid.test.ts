import { describe, expect, test } from "vitest";
import {
  isMermaidLanguage,
  mermaidLanguageFromClass,
  mermaidThemeFromDataTheme,
} from "./MermaidBlock";

describe("mermaidLanguageFromClass", () => {
  test("extracts language token from code className", () => {
    expect(mermaidLanguageFromClass("language-mermaid")).toBe("mermaid");
    expect(mermaidLanguageFromClass("language-typescript")).toBe("typescript");
    expect(mermaidLanguageFromClass("foo language-json bar")).toBe("json");
  });

  test("returns null when no language marker is present", () => {
    expect(mermaidLanguageFromClass(undefined)).toBeNull();
    expect(mermaidLanguageFromClass("")).toBeNull();
    expect(mermaidLanguageFromClass("inline-code")).toBeNull();
  });
});

describe("isMermaidLanguage", () => {
  test("matches only the exact mermaid language", () => {
    expect(isMermaidLanguage("mermaid")).toBe(true);
    expect(isMermaidLanguage("Mermaid")).toBe(false);
    expect(isMermaidLanguage("mermaidish")).toBe(false);
    expect(isMermaidLanguage("")).toBe(false);
    expect(isMermaidLanguage(null)).toBe(false);
    expect(isMermaidLanguage(undefined)).toBe(false);
  });
});

describe("mermaidThemeFromDataTheme", () => {
  test("maps resolved app theme to mermaid theme", () => {
    expect(mermaidThemeFromDataTheme("dark")).toBe("dark");
    expect(mermaidThemeFromDataTheme("light")).toBe("default");
    expect(mermaidThemeFromDataTheme(null)).toBe("default");
    expect(mermaidThemeFromDataTheme("unexpected")).toBe("default");
  });
});
