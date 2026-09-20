import { describe, expect, it } from "vitest";
import { externalDeleteDecision } from "./noteSurfaceSyncPolicy";
import type { NoteMetadata } from "../notes/types";

function note(id: string): NoteMetadata {
  return {
    id,
    title: `笔记 ${id}`,
    fileName: `${id}.md`,
    category: "",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    wordCount: 0,
    preview: "",
  };
}

describe("externalDeleteDecision", () => {
  it("没有编辑中的笔记时保持现状", () => {
    expect(externalDeleteDecision(null, [note("a")], true)).toBe("keep");
    expect(externalDeleteDecision(null, [], false)).toBe("keep");
  });

  it("编辑中的笔记仍在列表时保持现状", () => {
    expect(externalDeleteDecision("a", [note("a"), note("b")], true)).toBe("keep");
  });

  it("笔记被删除且编辑器有内容时解绑为草稿", () => {
    expect(externalDeleteDecision("a", [note("b")], true)).toBe("unbind");
  });

  it("笔记被删除且编辑器为空时直接重置", () => {
    expect(externalDeleteDecision("a", [note("b")], false)).toBe("reset");
    expect(externalDeleteDecision("a", [], false)).toBe("reset");
  });
});
