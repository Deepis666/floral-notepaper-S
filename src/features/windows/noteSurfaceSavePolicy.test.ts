import { describe, expect, test } from "vitest";
import {
  draftPersistDecision,
  shouldEnterPadFromTileOnDoubleClick,
  shouldReturnToTileAfterManualSave,
  shouldSaveBeforeSwitchingToTile,
} from "./noteSurfaceSavePolicy";

describe("note surface save policy", () => {
  test("skips persistence for blank drafts without a bound note", () => {
    expect(draftPersistDecision(null, "", "")).toBe("skip");
    expect(draftPersistDecision(null, "   ", "\n\t")).toBe("skip");
  });

  test("deletes bound note when the draft is cleared to blank", () => {
    expect(draftPersistDecision("note-a", "", "")).toBe("delete");
    expect(draftPersistDecision("note-a", " ", "  ")).toBe("delete");
  });

  test("saves drafts with any non-blank title or content", () => {
    expect(draftPersistDecision(null, "title", "")).toBe("save");
    expect(draftPersistDecision(null, "", "body")).toBe("save");
    expect(draftPersistDecision("note-a", "title", "body")).toBe("save");
    expect(draftPersistDecision("note-a", "", "body")).toBe("save");
  });

  test("keeps existing auto-save before tile switch behavior", () => {
    expect(shouldSaveBeforeSwitchingToTile(true)).toBe(true);
    expect(shouldSaveBeforeSwitchingToTile(false)).toBe(false);
  });

  test("allows double-click edit only when enabled and outside controls", () => {
    expect(shouldEnterPadFromTileOnDoubleClick(true, false)).toBe(true);
    expect(shouldEnterPadFromTileOnDoubleClick(false, false)).toBe(false);
    expect(shouldEnterPadFromTileOnDoubleClick(true, true)).toBe(false);
  });

  test("returns to tile only after manual save from a note surface", () => {
    expect(
      shouldReturnToTileAfterManualSave({
        enabled: true,
        noteId: "note-a",
        currentMode: "pad",
        isAutoSave: false,
      }),
    ).toBe(true);

    expect(
      shouldReturnToTileAfterManualSave({
        enabled: false,
        noteId: "note-a",
        currentMode: "pad",
        isAutoSave: false,
      }),
    ).toBe(false);
    expect(
      shouldReturnToTileAfterManualSave({
        enabled: true,
        noteId: "",
        currentMode: "pad",
        isAutoSave: false,
      }),
    ).toBe(false);
    expect(
      shouldReturnToTileAfterManualSave({
        enabled: true,
        noteId: "note-a",
        currentMode: "tile",
        isAutoSave: false,
      }),
    ).toBe(false);
    expect(
      shouldReturnToTileAfterManualSave({
        enabled: true,
        noteId: "note-a",
        currentMode: "pad",
        isAutoSave: true,
      }),
    ).toBe(false);
  });
});
