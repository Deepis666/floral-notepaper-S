import { convertFileSrc } from "@tauri-apps/api/core";
import { useMemo } from "react";
import type { CSSProperties } from "react";
import type { AppConfig } from "../features/settings/types";

interface BackgroundLayerProps {
  config: AppConfig | null;
}

// 背景图下的内容蒙版：只盖 UI 内容区，不整体蒙灰图片；
// 颜色取主题纸色（--color-paper），明暗主题自动适配。
// 无背景图或强度为 0 时返回 undefined，保持无背景图时的全透明观感。
export function contentShadeStyle(config: AppConfig | null): CSSProperties | undefined {
  const hasBackground = (config?.backgroundImagePath ?? "").trim() !== "";
  const shade = Math.max(0, Math.min(0.9, config?.contentShade ?? 0.35));
  if (!hasBackground || shade <= 0) return undefined;
  return {
    backgroundColor: `color-mix(in srgb, var(--color-paper) ${Math.round(shade * 100)}%, transparent)`,
  };
}

export function BackgroundLayer({ config }: BackgroundLayerProps) {
  const rawPath = config?.backgroundImagePath?.trim() ?? "";
  const convertedUrl = useMemo(() => (rawPath ? convertFileSrc(rawPath) : ""), [rawPath]);

  if (!rawPath) return null;

  const fit = config?.backgroundFit ?? "cover";
  const dim = Math.max(0, Math.min(1, config?.backgroundDim ?? 0.25));
  const blur = Math.max(0, Math.min(20, config?.backgroundBlur ?? 0));
  const scale = Math.max(0.5, Math.min(2, config?.backgroundScale ?? 1));
  const positionX = Math.max(0, Math.min(100, config?.backgroundPositionX ?? 50));
  const positionY = Math.max(0, Math.min(100, config?.backgroundPositionY ?? 50));

  const imageStyle = {
    objectPosition: `${positionX}% ${positionY}%` as const,
    filter: blur > 0 ? `blur(${blur}px)` : undefined,
    // CSS blur samples beyond image edges, causing pale fringes. No clean fix yet.
    transform: `scale(${scale})`,
    transformOrigin: `${positionX}% ${positionY}%`,
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {fit === "repeat" ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("${convertedUrl}")`,
            backgroundSize: "auto",
            backgroundPosition: `${positionX}% ${positionY}%`,
            backgroundRepeat: "repeat",
            ...imageStyle,
          }}
        />
      ) : (
        <img
          src={convertedUrl}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: fit === "contain" ? "contain" : "cover",
            ...imageStyle,
          }}
        />
      )}
      <div className="absolute inset-0 bg-cloud" style={{ opacity: dim }} />
    </div>
  );
}
