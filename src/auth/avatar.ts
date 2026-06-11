import { fetchJson } from '../config/api';
import { getCurrentUserId } from './session';
import type { UserAccountDto } from '../types/api';

const DEFAULT_AVATAR = '/assets/default-avatar.svg';
const AVATAR_KEY_PREFIX = 'memorylane-avatar-';

function getKey(): string {
  const userId = getCurrentUserId();
  return `${AVATAR_KEY_PREFIX}${userId ?? 'guest'}`;
}

export function getAvatar(): string {
  return localStorage.getItem(getKey()) || DEFAULT_AVATAR;
}

export function setAvatar(url: string): void {
  if (!url.trim()) {
    localStorage.setItem(getKey(), DEFAULT_AVATAR);
    return;
  }
  localStorage.setItem(getKey(), url.trim());

  const userId = getCurrentUserId();
  if (userId) {
    fetchJson<{ isSuccess: boolean; message: string }>('/api/user', {
      method: 'PUT',
      body: JSON.stringify({ id: userId, avatarUrl: url.trim() } as UserAccountDto),
    }).catch(() => {});
  }
}

export function getAvatarByUserId(userId: number): string | null {
  return localStorage.getItem(`${AVATAR_KEY_PREFIX}${userId}`);
}

export async function syncAvatarFromApi(): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;
  try {
    const user = await fetchJson<UserAccountDto>(`/api/user/id?id=${userId}`);
    if (user.avatarUrl) {
      localStorage.setItem(getKey(), user.avatarUrl);
    }
  } catch {
    // keep cached
  }
}
