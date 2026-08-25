import { describe, expect, test, vi } from "vitest";
import type { AppConfig } from "../features/settings/types";
import { contentShadeStyle } from "./BackgroundLayer";

vi.mock("@tauri-apps/api/core", () => ({
  convertFileSrc: (path: string) => `asset://${path}`,
}));

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    locale: "zh-CN",
    dataDir: "",
    globalShortcut: "",
    closeToTray: true,
    autostart: false,
    defaultViewMode: "edit",
    noteAutoSave: true,
    noteSurfaceAutoSave: true,
    tileColor: "#f6f3ec",
    tileColorMode: "system",
    theme: "system",
    fontSize: 14,
    surfaceFontSize: 14,
    tabIndentSize: 2,
    externalFileAutoSave: true,
    rememberSurfaceSize: true,
    tileCtrlClose: true,
    tileDoubleClickToEdit: false,
    tileSaveReturnsToPin: false,
    tileRenderMarkdown: false,
    renderHtmlMarkdown: true,
    splitScrollSync: true,
    toggleVisibilityShortcut: "",
    openHistoryShortcut: "",
    notepadAlwaysOnTop: true,
    openAtCursor: true,
    ...overrides,
  };
}

describe("contentShadeStyle", () => {
  test("returns undefined without a background image", () => {
    expect(contentShadeStyle(null)).toBeUndefined();
    expect(contentShadeStyle(makeConfig())).toBeUndefined();
    expect(contentShadeStyle(makeConfig({ backgroundImagePath: "   " }))).toBeUndefined();
  });

  test("returns undefined when shade is zero", () => {
    const config = makeConfig({ backgroundImagePath: "D:\\bg.jpg", contentShade: 0 });
    expect(contentShadeStyle(config)).toBeUndefined();
  });

  test("builds a theme-aware paper shade when a background is set", () => {
    const config = makeConfig({ backgroundImagePath: "D:\\bg.jpg", contentShade: 0.35 });
    expect(contentShadeStyle(config)).toEqual({
      backgroundColor: "color-mix(in srgb, var(--color-paper) 35%, transparent)",
    });
  });

  test("falls back to the default shade when unset and clamps out-of-range values", () => {
    const withDefault = makeConfig({ backgroundImagePath: "D:\\bg.jpg" });
    expect(contentShadeStyle(withDefault)?.backgroundColor).toContain("35%");

    const aboveRange = makeConfig({ backgroundImagePath: "D:\\bg.jpg", contentShade: 2 });
    expect(contentShadeStyle(aboveRange)?.backgroundColor).toContain("90%");

    const belowRange = makeConfig({ backgroundImagePath: "D:\\bg.jpg", contentShade: -1 });
    expect(contentShadeStyle(belowRange)).toBeUndefined();
  });
});
