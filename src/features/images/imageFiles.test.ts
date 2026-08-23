import { describe, expect, test } from "vitest";
import { collectImageFiles, extensionFromFileName, hasImageEntry } from "./useImagePaste";

interface FakeFile {
  name: string;
  type: string;
}

function fakeFile(name: string, type: string): FakeFile {
  return { name, type };
}

interface FakeItem {
  kind: string;
  type: string;
  file?: FakeFile;
}

function fakeDataTransfer(items: FakeItem[], files: FakeFile[] = []) {
  return {
    items: items.map((item) => ({
      kind: item.kind,
      type: item.type,
      getAsFile: () => item.file ?? null,
    })),
    files,
  };
}

describe("extensionFromFileName", () => {
  test("maps common image extensions case-insensitively", () => {
    expect(extensionFromFileName("photo.PNG")).toBe("png");
    expect(extensionFromFileName("photo.jpeg")).toBe("jpg");
    expect(extensionFromFileName("a/b/c/shot.WebP")).toBe("webp");
  });

  test("returns null for non-image or missing extensions", () => {
    expect(extensionFromFileName("notes.md")).toBeNull();
    expect(extensionFromFileName("archive.tar.gz")).toBeNull();
    expect(extensionFromFileName("noextension")).toBeNull();
    expect(extensionFromFileName("trailingdot.")).toBeNull();
  });
});

describe("collectImageFiles", () => {
  test("collects files from DataTransfer items with image MIME types", () => {
    const png = fakeFile("a.png", "image/png");
    const dt = fakeDataTransfer([{ kind: "file", type: "image/png", file: png }]);
    expect(collectImageFiles(dt)).toEqual([png]);
  });

  test("collects files that only appear in DataTransfer.files", () => {
    const jpg = fakeFile("b.jpg", "image/jpeg");
    const dt = fakeDataTransfer([], [jpg]);
    expect(collectImageFiles(dt)).toEqual([jpg]);
  });

  test("falls back to the file extension when the MIME type is empty", () => {
    const noMime = fakeFile("screenshot.png", "");
    const unknown = fakeFile("document.pdf", "");
    const dt = fakeDataTransfer(
      [
        { kind: "file", type: "", file: noMime },
        { kind: "file", type: "", file: unknown },
      ],
      [noMime],
    );
    expect(collectImageFiles(dt)).toEqual([noMime]);
  });

  test("ignores non-image files and de-duplicates repeated references", () => {
    const png = fakeFile("c.png", "image/png");
    const txt = fakeFile("readme.txt", "text/plain");
    const dt = fakeDataTransfer(
      [
        { kind: "file", type: "image/png", file: png },
        { kind: "file", type: "text/plain", file: txt },
        { kind: "string", type: "text/plain" },
      ],
      [png, txt],
    );
    expect(collectImageFiles(dt)).toEqual([png]);
  });
});

describe("hasImageEntry", () => {
  test("accepts items with image MIME types or empty MIME types", () => {
    expect(hasImageEntry(fakeDataTransfer([{ kind: "file", type: "image/png" }]))).toBe(true);
    expect(hasImageEntry(fakeDataTransfer([{ kind: "file", type: "" }]))).toBe(true);
  });

  test("rejects non-file entries and known non-image MIME types", () => {
    expect(hasImageEntry(fakeDataTransfer([{ kind: "string", type: "text/plain" }]))).toBe(false);
    expect(hasImageEntry(fakeDataTransfer([{ kind: "file", type: "text/plain" }]))).toBe(false);
    expect(hasImageEntry(fakeDataTransfer([]))).toBe(false);
  });
});
