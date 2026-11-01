import { useSyncExternalStore } from 'react';
import type { AnimeMedia } from '../types/anime';

/**
 * Single source of truth for the locally persisted watchlist and watch history.
 *
 * Parsed values are cached in memory so components can read them on every render
 * without re-parsing localStorage. Subscribers are notified on local writes and on
 * `storage` events from other tabs. The legacy `*_updated` window events are still
 * dispatched for backwards compatibility.
 */

export interface WatchHistoryItem {
  anilistId: number;
  episodeNumber: number;
  seasonNumber?: number;
  progressSeconds: number;
  totalSeconds: number;
  watchedAt: string;
  media?: AnimeMedia;
}

const WATCHLIST_KEY = 'animora_watchlist';
const LEGACY_WATCHLIST_KEY = 'crunchyroll_watchlist';
const HISTORY_KEY = 'animora_history';
const LEGACY_HISTORY_KEY = 'crunchyroll_history';
export const MAX_HISTORY_ITEMS = 30;

function readArray<T>(key: string, legacyKey: string): T[] {
  try {
    const raw = localStorage.getItem(key) ?? localStorage.getItem(legacyKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, legacyKey: string, value: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.removeItem(legacyKey);
  } catch (err) {
    console.warn(`Unable to persist ${key}`, err);
  }
}

function createStore<T>(key: string, legacyKey: string, eventName: string) {
  let cache: T[] | null = null;
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((l) => l());

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === key || e.key === legacyKey || e.key === null) {
        cache = null;
        notify();
      }
    });
  }

  return {
    get(): T[] {
      if (cache === null) cache = readArray<T>(key, legacyKey);
      return cache;
    },
    set(next: T[]) {
      cache = next;
      writeArray(key, legacyKey, next);
      notify();
      window.dispatchEvent(new Event(eventName));
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
}

export const watchlistStore = createStore<AnimeMedia>(WATCHLIST_KEY, LEGACY_WATCHLIST_KEY, 'watchlist_updated');
export const historyStore = createStore<WatchHistoryItem>(HISTORY_KEY, LEGACY_HISTORY_KEY, 'history_updated');

/** Full watchlist; re-renders only when the list changes. */
export function useWatchlist(): AnimeMedia[] {
  return useSyncExternalStore(watchlistStore.subscribe, watchlistStore.get, watchlistStore.get);
}

/** Boolean membership check; re-renders only when this title's membership changes. */
export function useIsInWatchlist(id: number | undefined): boolean {
  const getSnapshot = () => id !== undefined && watchlistStore.get().some((m) => m.id === id);
  return useSyncExternalStore(watchlistStore.subscribe, getSnapshot, getSnapshot);
}

export function useWatchHistory(): WatchHistoryItem[] {
  return useSyncExternalStore(historyStore.subscribe, historyStore.get, historyStore.get);
}

