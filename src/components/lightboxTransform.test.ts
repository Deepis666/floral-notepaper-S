import { describe, expect, test } from "vitest";
import { clampScale, zoomAtPoint } from "./lightboxTransform";

describe("clampScale", () => {
  test("keeps scale within bounds", () => {
    expect(clampScale(5, 0.2, 8)).toBe(5);
    expect(clampScale(0.01, 0.2, 8)).toBe(0.2);
    expect(clampScale(100, 0.2, 8)).toBe(8);
  });
});

describe("zoomAtPoint", () => {
  test("keeps the pointer-anchored image point fixed when zooming in", () => {
    const next = zoomAtPoint(1, 0, 0, 2, 100, 50, 0.2, 8);
    expect(next.scale).toBe(2);
    expect(next.x).toBe(-100);
    expect(next.y).toBe(-50);
  });

  test("keeps the pointer-anchored image point fixed when zooming out", () => {
    const next = zoomAtPoint(1, 0, 0, 0.5, 100, 50, 0.2, 8);
    expect(next.scale).toBe(0.5);
    expect(next.x).toBe(50);
    expect(next.y).toBe(25);
  });

  test("respects existing translation when zooming", () => {
    // 指针正好落在当前平移锚点时，平移量应保持不变
    const next = zoomAtPoint(2, 40, -60, 1.5, 40, -60, 0.2, 8);
    expect(next.scale).toBe(3);
    expect(next.x).toBe(40);
    expect(next.y).toBe(-60);
  });

  test("stops translating once the scale limit is reached", () => {
    const next = zoomAtPoint(8, 10, 10, 2, 100, 100, 0.2, 8);
    expect(next.scale).toBe(8);
    expect(next.x).toBe(10);
    expect(next.y).toBe(10);
  });

  test("chained zooms compose consistently", () => {
    let t = { scale: 1, x: 0, y: 0 };
    t = zoomAtPoint(t.scale, t.x, t.y, 1.2, 200, 150, 0.2, 8);
    t = zoomAtPoint(t.scale, t.x, t.y, 1.2, 200, 150, 0.2, 8);
    // 指针 (200,150) 下的内容点始终对应同一图像位置
    const imagePointX = (200 - t.x) / t.scale;
    const imagePointY = (150 - t.y) / t.scale;
    expect(imagePointX).toBeCloseTo((200 - 0) / 1, 10);
    expect(imagePointY).toBeCloseTo((150 - 0) / 1, 10);
  });
});
