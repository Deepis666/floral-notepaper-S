import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { saveImageFromPath } from "./api";
import { getErrorMessage } from "../notes/api";
import { insertTextAtCursor } from "./useImagePaste";

const TEXT_PATH_RE = /\.(md|markdown|txt)$/i;
const IMAGE_PATH_RE = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;

// 窗口配置中 dragDropEnabled 为 true 时，OS 级拖放由 Tauri 拦截，
// HTML drop 事件不会触发，因此主窗口与便签窗口都必须监听 Tauri 事件。
export function partitionDropPaths(paths: string[]): {
  textPaths: string[];
  imagePaths: string[];
} {
  const textPaths: string[] = [];
  const imagePaths: string[] = [];
  for (const path of paths) {
    if (TEXT_PATH_RE.test(path)) textPaths.push(path);
    else if (IMAGE_PATH_RE.test(path)) imagePaths.push(path);
  }
  return { textPaths, imagePaths };
}

interface UseTauriImageDropOptions {
  resolveNoteId: () => Promise<string | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  setContent: (content: string) => void;
  markDirty: () => void;
  onTextFile?: (path: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

export function useTauriImageDrop(options: UseTauriImageDropOptions) {
  // 通过 ref 持有最新选项，监听只注册一次，
  // 避免每次输入（content 变化）都注销再重注册事件监听
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const unlisten = getCurrentWindow().onDragDropEvent((event) => {
      if (event.payload.type !== "drop") return;
      const { textPaths, imagePaths } = partitionDropPaths(event.payload.paths);

      for (const path of textPaths) {
        optionsRef.current.onTextFile?.(path);
      }

      if (imagePaths.length === 0 || optionsRef.current.disabled) return;
      void (async () => {
        const { resolveNoteId, textareaRef, setContent, markDirty, onError } = optionsRef.current;
        try {
          const noteId = await resolveNoteId();
          if (!noteId) return;
          const textarea = textareaRef.current;
          if (!textarea) return;
          const rels = await Promise.all(imagePaths.map((path) => saveImageFromPath(noteId, path)));
          const markdown = rels.map((rel) => `![](${rel})`).join("\n");
          insertTextAtCursor(textarea, setContent, markdown);
          markDirty();
        } catch (error) {
          onError?.(getErrorMessage(error));
        }
      })();
    });

    return () => {
      void unlisten.then((fn) => fn());
    };
  }, []);
}
