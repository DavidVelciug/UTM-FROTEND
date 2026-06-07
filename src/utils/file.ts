import { apiUrl } from '../config/api';

const CAPSULE_COVER_PREFIX = '__cover__:';

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));
    reader.readAsDataURL(file);
  });
}

export function resolveMediaUrl(value?: string | null, fallback = ''): string {
  const src = value?.trim().replace(/\\/g, '/');
  if (!src) return fallback;
  if (src.startsWith('data:')) return src;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) return src;

  if (src.startsWith('/')) {
    if (src.startsWith('/uploads/')) return apiUrl(src);
    return src;
  }

  if (src.startsWith('uploads/')) {
    return apiUrl(`/${src}`);
  }

  return `/${src}`;
}

export function isVideoSource(value?: string | null): boolean {
  if (!value) return false;
  const src = value.trim().toLowerCase();
  if (!src) return false;
  return /\.(mp4|webm|mov|avi|mkv|wmv|flv|m4v|3gp|ogv)(\?.*)?$/i.test(src);
}

export function isAudioSource(value?: string | null): boolean {
  if (!value) return false;
  const src = value.trim().toLowerCase();
  if (!src) return false;
  return /\.(mp3|wav|ogg|flac|aac|m4a|wma|opus)(\?.*)?$/i.test(src);
}

export function isImageSource(value?: string | null): boolean {
  if (!value) return false;
  const src = value.trim().toLowerCase();
  if (!src) return false;
  if (src.startsWith('data:image/')) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/.test(src);
}

export function extractAttachmentPaths(value?: string | null): string[] {
  return parseCapsuleStorage(value).attachments;
}

export function parseCapsuleStorage(value?: string | null): { cover: string | null; attachments: string[] } {
  if (!value) return { cover: null, attachments: [] };
  const parts = value
    .split(/\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  let cover: string | null = null;
  const attachments: string[] = [];

  for (const part of parts) {
    if (part.startsWith(CAPSULE_COVER_PREFIX)) {
      const nextCover = part.slice(CAPSULE_COVER_PREFIX.length).trim();
      if (nextCover) cover = nextCover;
      continue;
    }
    attachments.push(part);
  }

  return { cover, attachments };
}

export function resolveUserAvatar(ownerUserId: number, ownerDisplayName?: string | null): string {
  const seed = `${ownerUserId}-${ownerDisplayName ?? 'user'}`;
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
}

export function getCapsuleThumbnailUrl(c: {
  contentType: number;
  fileStoragePath?: string | null;
  linkUrl?: string | null;
}): string {
  const parsed = parseCapsuleStorage(c.fileStoragePath);
  if (parsed.cover) {
    return resolveMediaUrl(parsed.cover, '/assets/default-capsule-cover.svg');
  }
  const firstAttachment = parsed.attachments[0];
  if (firstAttachment) {
    return resolveMediaUrl(firstAttachment, '/assets/default-capsule-cover.svg');
  }
  if (c.fileStoragePath) {
    return resolveMediaUrl(c.fileStoragePath, '/assets/default-capsule-cover.svg');
  }
  if (c.contentType === 1 && c.linkUrl) {
    return '/assets/default-capsule-cover.svg';
  }
  return '/assets/default-capsule-cover.svg';
}
