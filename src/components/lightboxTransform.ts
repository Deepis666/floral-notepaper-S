export interface LightboxTransform {
  scale: number;
  x: number;
  y: number;
}

export function clampScale(scale: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, scale));
}

/**
 * 以指针位置 (px, py) 为锚点缩放：缩放前后指针下的图像内容点保持不动。
 * 推导自 (px - x) / scale 在缩放前后不变，解出新的平移量。
 */
export function zoomAtPoint(
  scale: number,
  x: number,
  y: number,
  factor: number,
  px: number,
  py: number,
  min: number,
  max: number,
): LightboxTransform {
  const nextScale = clampScale(scale * factor, min, max);
  const applied = nextScale / scale;
  return {
    scale: nextScale,
    x: px - (px - x) * applied,
    y: py - (py - y) * applied,
  };
}
