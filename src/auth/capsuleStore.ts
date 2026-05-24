import type { TimeCapsuleDto } from '../types/api';
import { getCurrentUserId } from './session';

const openedKeyPrefix = 'memorylane-opened-capsules-';

export type OpenedCapsuleItem = TimeCapsuleDto & { openedAtUtc: string };

function getOpenedKey(): string {
  return `${openedKeyPrefix}${getCurrentUserId() ?? 0}`;
}

export function getOpenedCapsules(): OpenedCapsuleItem[] {
  const raw = localStorage.getItem(getOpenedKey());
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OpenedCapsuleItem[];
  } catch {
    return [];
  }
}

export function addOpenedCapsule(capsule: TimeCapsuleDto, openedFrom?: string): void {
  const list = getOpenedCapsules();
  const source = openedFrom ?? capsule.openedFrom ?? (capsule.isPublic ? 'Публичная капсула' : 'Присланная капсула');
  const existing = list.find((item) => item.id === capsule.id);
  if (existing) {
    existing.openedFrom = source;
    existing.openedAtUtc = new Date().toISOString();
    localStorage.setItem(getOpenedKey(), JSON.stringify(list));
    return;
  }
  list.unshift({
    ...capsule,
    openedAtUtc: new Date().toISOString(),
    openedFrom: source,
  });
  localStorage.setItem(getOpenedKey(), JSON.stringify(list));
}
