import { getAccessToken, getRole } from '../auth/session';
import { getMockEntry } from '../data/mockData';

export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

function mergeArrays(real: unknown[], mock: unknown[]): unknown[] {
  const realIds = new Set(real.map((x: any) => x.id));
  const extra = mock.filter((x: any) => x.id != null && !realIds.has(x.id));
  return [...real, ...extra];
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const mockEntry = getMockEntry<T>(path, init);

  if (mockEntry && mockEntry.merge === 'replace') {
    return mockEntry.data;
  }

  try {
    const token = getAccessToken();
    const res = await fetch(apiUrl(path), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : { 'X-User-Role': getRole() }),
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    const realData = await res.json() as T;

    if (mockEntry && mockEntry.merge === 'concat' && Array.isArray(realData) && Array.isArray(mockEntry.data)) {
      return mergeArrays(realData as unknown[], mockEntry.data as unknown[]) as T;
    }

    return realData;
  } catch {
    if (mockEntry && mockEntry.merge !== 'skip') {
      return mockEntry.data;
    }
    throw new Error('Сервер недоступен');
  }
}
