import { useEffect, useRef, useState } from "react";
import { zoomAtPoint } from "./lightboxTransform";

const MIN_SCALE = 0.2;
const MAX_SCALE = 8;
const WHEEL_ZOOM_FACTOR = 1.1;

interface LightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

/**
 * 全屏图片查看器：滚轮以指针为锚缩放、拖拽平移、双击复位、ESC 或点击背景关闭。
 * 仅在主窗口预览中启用，磁贴不接入以防误触。
 */
export function Lightbox({ src, alt = "", onClose }: LightboxProps) {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    // React 的 onWheel 是 passive 监听，无法 preventDefault；
    // 缩放必须阻止滚轮冒泡，否则背景预览会跟着滚动
    const overlay = overlayRef.current;
    if (!overlay) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR;
      setTransform((t) =>
        zoomAtPoint(t.scale, t.x, t.y, factor, event.clientX, event.clientY, MIN_SCALE, MAX_SCALE),
      );
    };
    overlay.addEventListener("wheel", handleWheel, { passive: false });
    return () => overlay.removeEventListener("wheel", handleWheel);
  }, []);

  const resetTransform = () => setTransform({ scale: 1, x: 0, y: 0 });

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={alt || "image"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragState.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            baseX: transform.x,
            baseY: transform.y,
          };
          setDragging(true);
        }}
        onPointerMove={(event) => {
          const drag = dragState.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          setTransform((t) => ({
            ...t,
            x: drag.baseX + (event.clientX - drag.startX),
            y: drag.baseY + (event.clientY - drag.startY),
          }));
        }}
        onPointerUp={() => {
          dragState.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          dragState.current = null;
          setDragging(false);
        }}
        onDoubleClick={resetTransform}
        className={`max-h-[92vh] max-w-[92vw] select-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transition: dragging ? "none" : "transform 0.15s ease-out",
        }}
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="close"
        className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-4 w-4"
        >
          <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
