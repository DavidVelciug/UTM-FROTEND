import type { UserLoginResultDto } from '../types/api';

export type AppRole = 'guest' | 'user' | 'moderator' | 'admin';

const STORAGE_KEY = 'memorylane-role';
const USER_ID_STORAGE_KEY = 'memorylane-user-id';
const USER_NAME_STORAGE_KEY = 'memorylane-user-name';
const USER_EMAIL_STORAGE_KEY = 'memorylane-user-email';
const ACCESS_TOKEN_KEY = 'memorylane-access-token';
const REFRESH_TOKEN_KEY = 'memorylane-refresh-token';
const SESSION_EVENT = 'memorylane-session-changed';

const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

function apiOrigin(): string {
  return import.meta.env.VITE_API_URL ?? '';
}

function buildApiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${apiOrigin()}${normalized}`;
}

function emitSessionChanged(): void {
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

let refreshTimer: ReturnType<typeof setInterval> | null = null;

function clearRefreshTimer(): void {
  if (refreshTimer !== null) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRole(): AppRole {
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === 'user' || value === 'moderator' || value === 'admin' || value === 'guest') {
    return value;
  }

  return 'guest';
}

export function setRole(role: AppRole): void {
  localStorage.setItem(STORAGE_KEY, role);
  emitSessionChanged();
}

export function setCurrentUser(userId: number, displayName?: string | null): void {
  localStorage.setItem(USER_ID_STORAGE_KEY, String(userId));
  if (displayName) {
    localStorage.setItem(USER_NAME_STORAGE_KEY, displayName);
  }
  emitSessionChanged();
}

export function getCurrentUserId(): number | null {
  const value = localStorage.getItem(USER_ID_STORAGE_KEY);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getCurrentUserEmail(): string | null {
  return localStorage.getItem(USER_EMAIL_STORAGE_KEY);
}

export function getCurrentDisplayName(): string | null {
  return localStorage.getItem(USER_NAME_STORAGE_KEY);
}

export function persistAuthFromLogin(result: UserLoginResultDto): void {
  if (!result.isSuccess || result.userId == null) {
    return;
  }

  setRole(result.role as AppRole);
  setCurrentUser(result.userId, result.displayName);
  if (result.email) {
    localStorage.setItem(USER_EMAIL_STORAGE_KEY, result.email);
  }
  if (result.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
  }
  if (result.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
  }
  emitSessionChanged();
  startTokenRefreshSchedule();
}

async function refreshAccessToken(): Promise<boolean> {
  const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!rt) {
    return false;
  }

  try {
    const res = await fetch(buildApiUrl('/api/user/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!res.ok) {
      logout();
      return false;
    }

    const data = (await res.json()) as UserLoginResultDto;
    if (!data.isSuccess || data.userId == null) {
      logout();
      return false;
    }

    persistAuthFromLogin(data);
    return true;
  } catch {
    logout();
    return false;
  }
}

export function startTokenRefreshSchedule(): void {
  clearRefreshTimer();
  if (!localStorage.getItem(REFRESH_TOKEN_KEY)) {
    return;
  }

  refreshTimer = window.setInterval(() => {
    void refreshAccessToken();
  }, REFRESH_INTERVAL_MS);
}

export function initAuthOnLoad(): void {
  if (localStorage.getItem(REFRESH_TOKEN_KEY)) {
    void refreshAccessToken().then((ok) => {
      if (ok) {
        startTokenRefreshSchedule();
      }
    });
  }
}

export function logout(): void {
  clearRefreshTimer();
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_ID_STORAGE_KEY);
  localStorage.removeItem(USER_NAME_STORAGE_KEY);
  localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  emitSessionChanged();
}

export function subscribeSessionChange(listener: () => void): () => void {
  window.addEventListener(SESSION_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(SESSION_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

export function canAccess(role: AppRole, page: 'moderation' | 'stats'): boolean {
  if (page === 'stats') {
    return role === 'admin';
  }

  if (page === 'moderation') {
    return role === 'moderator' || role === 'admin';
  }

  return false;
}

export function canUseExtendedFeatures(role: AppRole): boolean {
  return role !== 'guest';
}
