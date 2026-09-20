import type { NoteMetadata } from "../notes/types";

export type ExternalDeleteDecision = "keep" | "unbind" | "reset";

// 笔记列表在外部发生变化（主窗口删除、回收站还原等）后，决定便签当前编辑态如何处理：
// - keep：没有编辑中的笔记，或它仍然存在，不做任何处理
// - unbind：编辑中的笔记已在别处被删除，但编辑器还有草稿内容 → 解绑为未保存草稿，
//   避免后续保存继续对已删除的 id 调 updateNote 报错
// - reset：笔记被删除且编辑器本身为空 → 直接回到空白状态
export function externalDeleteDecision(
  editingNoteId: string | null,
  notes: readonly NoteMetadata[],
  hasDraftText: boolean,
): ExternalDeleteDecision {
  if (!editingNoteId) return "keep";
  if (notes.some((note) => note.id === editingNoteId)) return "keep";
  return hasDraftText ? "unbind" : "reset";
}
