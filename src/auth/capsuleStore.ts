import { fetchJson } from '../config/api';
import { getCurrentUserId } from './session';
import type { TimeCapsuleDto, ResponceMsg } from '../types/api';

export type OpenedCapsuleItem = TimeCapsuleDto & { openedAtUtc: string; catalogPrice?: number };

const openedKeyPrefix = 'memorylane-opened-capsules-';

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

export function addOpenedCapsule(capsule: TimeCapsuleDto, openedFrom?: string, catalogPrice?: number): void {
  const list = getOpenedCapsules();
  const source = openedFrom ?? capsule.openedFrom ?? (capsule.isPublic ? 'Публичная капсула' : 'Присланная капсула');
  const existing = list.find((item) => item.id === capsule.id);
  if (existing) {
    existing.openedFrom = source;
    existing.openedAtUtc = new Date().toISOString();
    if (catalogPrice !== undefined) existing.catalogPrice = catalogPrice;
    localStorage.setItem(getOpenedKey(), JSON.stringify(list));
    return;
  }
  list.unshift({
    ...capsule,
    openedAtUtc: new Date().toISOString(),
    openedFrom: source,
    catalogPrice: catalogPrice,
  });
  localStorage.setItem(getOpenedKey(), JSON.stringify(list));

  const userId = getCurrentUserId();
  if (userId) {
    fetchJson<ResponceMsg>('/api/openedcapsule', {
      method: 'POST',
      body: JSON.stringify({ userId, capsuleId: capsule.id, openedFrom: source }),
    }).catch(() => {});
  }
}

export async function syncOpenedCapsulesFromApi(): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;
  try {
    const capsules = await fetchJson<TimeCapsuleDto[]>(`/api/openedcapsule/forUser?userId=${userId}`);
    const mapped = capsules.map((c) => ({
      ...c,
      openedAtUtc: c.openedAtUtc ?? new Date().toISOString(),
      openedFrom: c.openedFrom ?? '',
    }));
    localStorage.setItem(getOpenedKey(), JSON.stringify(mapped));
  } catch {
    // keep cached
  }
}
