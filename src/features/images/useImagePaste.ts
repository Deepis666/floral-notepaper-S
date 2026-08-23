import { useCallback, useRef } from "react";
import type { TFunction } from "i18next";
import { saveImage } from "./api";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB

const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/bmp": "bmp",
  "image/svg+xml": "svg",
};

const EXTENSION_TO_EXT: Record<string, string> = {
  png: "png",
  jpg: "jpg",
  jpeg: "jpg",
  gif: "gif",
  webp: "webp",
  bmp: "bmp",
  svg: "svg",
};

export function extensionFromFileName(name: string): string | null {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === name.length - 1) return null;
  return EXTENSION_TO_EXT[name.slice(dotIndex + 1).toLowerCase()] ?? null;
}

export interface ClipboardFileLike {
  readonly name: string;
  readonly type: string;
}

interface ClipboardItemLike<T extends ClipboardFileLike> {
  readonly kind: string;
  readonly type: string;
  getAsFile(): T | null;
}

interface DataTransferLike<T extends ClipboardFileLike> {
  readonly items: ArrayLike<ClipboardItemLike<T>>;
  readonly files: ArrayLike<T>;
}

// Windows 剪贴板/拖拽场景下，图片可能只出现在 DataTransfer.files 中，
// 或 MIME type 为空但文件名仍是 .png / .jpg 等。这里同时遍历 items 与
// files 并允许扩展名回退，避免因检测过严而静默丢弃图片。
export function collectImageFiles<T extends ClipboardFileLike>(
  dataTransfer: DataTransferLike<T>,
): T[] {
  const picked: T[] = [];
  const seen = new Set<T>();

  const pick = (file: T | null | undefined) => {
    if (!file || seen.has(file)) return;
    if (file.type in MIME_TO_EXT || extensionFromFileName(file.name)) {
      seen.add(file);
      picked.push(file);
    }
  };

  for (let i = 0; i < dataTransfer.items.length; i += 1) {
    const item = dataTransfer.items[i];
    if (item.kind === "file") pick(item.getAsFile());
  }
  for (let i = 0; i < dataTransfer.files.length; i += 1) {
    pick(dataTransfer.files[i]);
  }
  return picked;
}

// dragover 阶段拿不到文件内容，只能凭 item 元信息乐观判断；
// MIME 为空的文件条目也放行，真正过滤交给拖放时的 collectImageFiles。
export function hasImageEntry(dataTransfer: DataTransferLike<ClipboardFileLike>): boolean {
  for (let i = 0; i < dataTransfer.items.length; i += 1) {
    const item = dataTransfer.items[i];
    if (item.kind === "file" && (item.type in MIME_TO_EXT || item.type === "")) {
      return true;
    }
  }
  return false;
}

interface UseImagePasteOptions {
  noteId: string | null;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  setContent: (content: string) => void;
  markDirty: () => void;
  onEnsureNoteSaved: () => Promise<string | null>;
  disabled?: boolean;
  onError?: (message: string) => void;
  t?: TFunction;
}

async function processImageFile(file: File, noteId: string, t?: TFunction): Promise<string | null> {
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      t?.("errors.imageTooLarge", { defaultValue: "图片文件过大（上限 20 MB）" }) ??
        "图片文件过大（上限 20 MB）",
    );
  }

  const ext = MIME_TO_EXT[file.type] ?? extensionFromFileName(file.name);
  if (!ext) return null;

  const buffer = await file.arrayBuffer();
  return saveImage(noteId, new Uint8Array(buffer), ext);
}

export function insertTextAtCursor(
  textarea: HTMLTextAreaElement,
  setContent: (value: string) => void,
  text: string,
) {
  const before = textarea.value.slice(0, textarea.selectionStart);
  const needsLeadingNewline = before.length > 0 && !before.endsWith("\n");
  const insertion = (needsLeadingNewline ? "\n" : "") + text + "\n";

  textarea.focus();
  document.execCommand("insertText", false, insertion);
  setContent(textarea.value);
}

function getImageFiles(dataTransfer: DataTransfer): File[] {
  return collectImageFiles(dataTransfer);
}

export function useImagePaste({
  noteId,
  textareaRef,
  setContent,
  markDirty,
  onEnsureNoteSaved,
  disabled,
  onError,
  t,
}: UseImagePasteOptions) {
  const processingRef = useRef(false);

  const processFiles = useCallback(
    async (files: File[]) => {
      if (processingRef.current || files.length === 0) return;
      processingRef.current = true;

      try {
        let resolvedId = noteId;
        if (!resolvedId) {
          resolvedId = await onEnsureNoteSaved();
          if (!resolvedId) return;
        }

        const textarea = textareaRef.current;
        if (!textarea) return;

        const markdownLines: string[] = [];
        for (const file of files) {
          const relativePath = await processImageFile(file, resolvedId, t);
          if (relativePath) {
            markdownLines.push(`![](${relativePath})`);
          }
        }

        if (markdownLines.length > 0) {
          insertTextAtCursor(textarea, setContent, markdownLines.join("\n"));
          markDirty();
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : (t?.("errors.imagePasteFailed", { defaultValue: "图片粘贴失败" }) ?? "图片粘贴失败");
        onError?.(message);
      } finally {
        processingRef.current = false;
      }
    },
    [noteId, textareaRef, setContent, markDirty, onEnsureNoteSaved, onError, t],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (disabled) return;
      const files = getImageFiles(event.clipboardData);
      if (files.length === 0) return;
      event.preventDefault();
      void processFiles(files);
    },
    [disabled, processFiles],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLTextAreaElement>) => {
      if (disabled) return;
      const files = getImageFiles(event.dataTransfer);
      if (files.length === 0) return;
      event.preventDefault();
      void processFiles(files);
    },
    [disabled, processFiles],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLTextAreaElement>) => {
      if (disabled) return;
      if (hasImageEntry(event.dataTransfer)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }
    },
    [disabled],
  );

  return { handlePaste, handleDrop, handleDragOver };
}
