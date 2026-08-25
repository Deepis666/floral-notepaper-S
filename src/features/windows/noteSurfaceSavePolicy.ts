import type { NoteSurfaceMode } from "./surfaceMode";

export type DraftPersistDecision = "save" | "skip" | "delete";

// 标题与内容均为空时的落库策略：没有已绑定笔记则不落库（skip），
// 已绑定笔记则删除该空记录（delete），避免空便签长期残留；否则正常保存。
export function draftPersistDecision(
  editingNoteId: string | null,
  title: string,
  content: string,
): DraftPersistDecision {
  const isEmpty = !title.trim() && !content.trim();
  if (!isEmpty) return "save";
  return editingNoteId ? "delete" : "skip";
}

export function shouldSaveBeforeSwitchingToTile(autoSave: boolean): boolean {
  return autoSave;
}

export function shouldEnterPadFromTileOnDoubleClick(
  enabled: boolean,
  isControlTarget: boolean,
): boolean {
  return enabled && !isControlTarget;
}

export function shouldReturnToTileAfterManualSave({
  enabled,
  noteId,
  currentMode,
  isAutoSave,
}: {
  enabled: boolean;
  noteId: string;
  currentMode: NoteSurfaceMode;
  isAutoSave: boolean;
}): boolean {
  return enabled && Boolean(noteId) && currentMode === "pad" && !isAutoSave;
}
