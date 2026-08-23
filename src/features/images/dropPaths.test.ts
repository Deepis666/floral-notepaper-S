import { describe, expect, test } from "vitest";
import { partitionDropPaths } from "./useTauriImageDrop";

describe("partitionDropPaths", () => {
  test("splits text and image paths case-insensitively", () => {
    const result = partitionDropPaths([
      "C:\\docs\\note.md",
      "D:\\a.TXT",
      "photo.PNG",
      "shot.jpeg",
      "anim.GIF",
    ]);
    expect(result.textPaths).toEqual(["C:\\docs\\note.md", "D:\\a.TXT"]);
    expect(result.imagePaths).toEqual(["photo.PNG", "shot.jpeg", "anim.GIF"]);
  });

  test("ignores unsupported file types", () => {
    const result = partitionDropPaths(["app.exe", "data.json", "movie.mp4", "archive.zip"]);
    expect(result.textPaths).toEqual([]);
    expect(result.imagePaths).toEqual([]);
  });

  test("accepts markdown and webp variants", () => {
    const result = partitionDropPaths(["readme.markdown", "pic.webp", "icon.bmp", "logo.svg"]);
    expect(result.textPaths).toEqual(["readme.markdown"]);
    expect(result.imagePaths).toEqual(["pic.webp", "icon.bmp", "logo.svg"]);
  });

  test("returns empty arrays for empty input", () => {
    expect(partitionDropPaths([])).toEqual({ textPaths: [], imagePaths: [] });
  });
});
