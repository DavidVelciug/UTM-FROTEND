import { fetchJson } from '../config/api';
import { getCurrentUserId } from './session';
import type { ResponceMsg } from '../types/api';

type Reaction = 'like' | 'dislike';

const CATALOG_KEY = 'memorylane-catalog-reactions';
const FEED_KEY = 'memorylane-feed-reactions';

type ReactionsByUser = Record<string, Record<number, Reaction>>;

function readMap(key: string): ReactionsByUser {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}

function writeMap(key: string, map: ReactionsByUser): void {
  localStorage.setItem(key, JSON.stringify(map));
}

function getUserKey(): string {
  return String(getCurrentUserId() ?? 0);
}

export function toggleCatalogReaction(productId: number, reaction: Reaction): Reaction | null {
  const map = readMap(CATALOG_KEY);
  const userKey = getUserKey();
  if (!map[userKey]) map[userKey] = {};
  if (map[userKey][productId] === reaction) {
    delete map[userKey][productId];
  } else {
    map[userKey][productId] = reaction;
  }
  writeMap(CATALOG_KEY, map);

  const userId = getCurrentUserId();
  if (userId) {
    fetchJson<ResponceMsg>('/api/reaction/product/toggle', {
      method: 'POST',
      body: JSON.stringify({ userId, productId, type: reaction }),
    }).catch(() => {});
  }

  return map[userKey]?.[productId] ?? null;
}

export function getCatalogCounts(productId: number): { likes: number; dislikes: number } {
  const map = readMap(CATALOG_KEY);
  let likes = 0, dislikes = 0;
  Object.values(map).forEach((um) => {
    if (um[productId] === 'like') likes++;
    if (um[productId] === 'dislike') dislikes++;
  });
  return { likes, dislikes };
}

export function getCatalogUserReaction(productId: number): Reaction | null {
  const map = readMap(CATALOG_KEY);
  return map[getUserKey()]?.[productId] ?? null;
}

export function toggleFeedReaction(capsuleId: number, reaction: Reaction): Reaction | null {
  const map = readMap(FEED_KEY);
  const userKey = getUserKey();
  if (!map[userKey]) map[userKey] = {};
  if (map[userKey][capsuleId] === reaction) {
    delete map[userKey][capsuleId];
  } else {
    map[userKey][capsuleId] = reaction;
  }
  writeMap(FEED_KEY, map);

  const userId = getCurrentUserId();
  if (userId) {
    fetchJson<ResponceMsg>('/api/reaction/capsule/toggle', {
      method: 'POST',
      body: JSON.stringify({ userId, capsuleId, type: reaction }),
    }).catch(() => {});
  }

  return map[userKey]?.[capsuleId] ?? null;
}

export function getFeedCounts(capsuleId: number): { likes: number; dislikes: number } {
  const map = readMap(FEED_KEY);
  let likes = 0, dislikes = 0;
  Object.values(map).forEach((um) => {
    if (um[capsuleId] === 'like') likes++;
    if (um[capsuleId] === 'dislike') dislikes++;
  });
  return { likes, dislikes };
}

export function getFeedUserReaction(capsuleId: number): Reaction | null {
  const map = readMap(FEED_KEY);
  return map[getUserKey()]?.[capsuleId] ?? null;
}
