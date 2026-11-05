import { getWatchUrl, getAnimeTitle } from '../lib/slug';
import {
  HomeCatalogResponse,
  BrowseResponse,
  AnimeMedia,
  EpisodeItemDTO,
  FranchiseSeasonNode,
  AiringScheduleItem,
  MirrorBoxStream
} from '../types/anime';
import {
  clientFetchHomeCatalog,
  clientFetchBrowse,
  clientFetchAnimeDetail,
  clientFetchCalendar
} from './clientAniList';
import { resolveCrosswalkStream } from './crosswalkResolver';
import {
  watchlistStore,
  historyStore,
  MAX_HISTORY_ITEMS,
  type WatchHistoryItem
} from '../lib/userStore';

export type { WatchHistoryItem };

const API_BASE = '/api/v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchSafeJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

/**
 * Memoises catalog lookups for a few minutes and shares in-flight promises, so
 * concurrent callers (StrictMode double effects, re-mounts, back navigation)
 * never fire duplicate requests. Failed lookups are evicted immediately.
 */
const responseCache = new Map<string, { at: number; promise: Promise<unknown> }>();

function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = responseCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.promise as Promise<T>;

  const promise = loader().catch((err) => {
    responseCache.delete(key);
    throw err;
  });
  responseCache.set(key, { at: Date.now(), promise });
  return promise;
}

/** Tries the BFF first, then falls back to querying AniList directly from the browser. */
async function withFallback<T>(label: string, primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await primary();
  } catch (err) {
    console.warn(`Backend ${label} unreachable, falling back to direct AniList GraphQL:`, err);
    return fallback();
  }
}

export function fetchHomeCatalog(): Promise<HomeCatalogResponse> {
  return cached('home', () =>
    withFallback('home catalog', () => fetchSafeJson(`${API_BASE}/anime/home`), clientFetchHomeCatalog)
  );
}

export interface BrowseParams {
  page?: number;
  perPage?: number;
  search?: string;
  genre?: string;
  format?: string;
  season?: string;
  seasonYear?: number;
  status?: string;
  sort?: string;
}

export function fetchBrowse(params: BrowseParams = {}): Promise<BrowseResponse> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  }
  const qs = query.toString();

  return cached(`browse?${qs}`, () =>
    withFallback(
      'browse',
      () => fetchSafeJson(`${API_BASE}/anime/browse?${qs}`),
      () => clientFetchBrowse(params)
    )
  );
}

export interface AnimeDetailResponse {
  media: AnimeMedia;
  episodes: EpisodeItemDTO[];
  franchiseSeasons: FranchiseSeasonNode[];
}

export function fetchAnimeDetail(
  id: string | number,
  options?: { format?: string; seasonYear?: number }
): Promise<AnimeDetailResponse> {
  const query = new URLSearchParams();
  if (options?.format) query.set('format', options.format);
  if (options?.seasonYear) query.set('year', String(options.seasonYear));
  const qs = query.toString() ? `?${query.toString()}` : '';

  return cached(`detail:${id}${qs}`, () =>
    withFallback(
      'detail',
      () => fetchSafeJson(`${API_BASE}/anime/${id}${qs}`),
      () => clientFetchAnimeDetail(String(id), options)
    )
  );
}

export function fetchCalendar(startUnix?: number, endUnix?: number): Promise<{ schedules: AiringScheduleItem[] }> {
  const query = new URLSearchParams();
  if (startUnix) query.set('startUnix', String(startUnix));
  if (endUnix) query.set('endUnix', String(endUnix));
  const qs = query.toString();

  return cached(`calendar?${qs}`, () =>
    withFallback(
      'calendar',
      () => fetchSafeJson(`${API_BASE}/anime/calendar?${qs}`),
      async () => {
        const schedules = await clientFetchCalendar(undefined, undefined, startUnix, endUnix);
        return { schedules };
      }
    )
  );
}


export interface AniKotoScheduleItem {
  id: string;
  title: string;
  title_jp?: string;
  episode: string;
  time: string;
  timestamp: string;
  airing_status: string;
  audio_type?: string;
  poster: string;
  description?: string;
  genres?: string[];
  slug?: string;
  url?: string;
}

export interface AniKotoDaySchedule {
  day: string;
  label: string;
  timestamp: string;
  is_today: boolean;
  is_past: boolean;
  total_scheduled: number;
  items: AniKotoScheduleItem[];
}

export interface AniKotoScheduleResponse {
  source: string;
  timezone_offset: number;
  scraped_at: string;
  days: string[];
  schedule: Record<string, AniKotoDaySchedule>;
}

export async function fetchAniKotoSchedule(day?: string): Promise<AniKotoScheduleResponse> {
  const query = day ? `?day=${encodeURIComponent(day.toLowerCase())}` : '';
  const url = `https://anifetch.code9x-rs.workers.dev/api/anikoto/schedule${query}`;

  return cached(`anikoto_schedule_${day || 'all'}`, async () => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Schedule service returned HTTP ${res.status}`);
    }
    return res.json();
  });
}

export async function resolveStream(
  anilistId: number,
  episode: number = 1,
  format: string = 'TV',
  malId?: number | null
): Promise<MirrorBoxStream> {
  try {
    const query = new URLSearchParams({ episode: String(episode), format });
    if (malId) query.set('malId', String(malId));
    return await fetchSafeJson(`${API_BASE}/stream/resolve/${anilistId}?${query.toString()}`);
  } catch {
    return resolveCrosswalkStream(anilistId, episode, format, malId);
  }
}

/** Fire-and-forget sync to the BFF; local storage remains the source of truth for the UI. */
function syncToServer(path: string, init: RequestInit) {
  fetch(`${API_BASE}${path}`, init).catch(() => {
    /* offline or backend unavailable — local state is already updated */
  });
}

const jsonPost = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

/**
 * Returns the local watchlist. If this device has nothing stored yet, it is
 * hydrated once from the backend so existing server-side data is not lost.
 */
export async function getWatchlist(): Promise<AnimeMedia[]> {
  const local = watchlistStore.get();
  if (local.length > 0) return local;
  try {
    const data = await fetchSafeJson(`${API_BASE}/user/watchlist`);
    if (Array.isArray(data.watchlist) && data.watchlist.length > 0) {
      watchlistStore.set(data.watchlist);
      return data.watchlist;
    }
  } catch {
    /* backend unavailable */
  }
  return local;
}

export function isInWatchlist(id: number): boolean {
  return watchlistStore.get().some((m) => m.id === id);
}

/** Adds or removes a title. Returns `true` when the title is now in the watchlist. */
export async function toggleWatchlist(media: AnimeMedia): Promise<boolean> {
  const list = watchlistStore.get();
  const exists = list.some((m) => m.id === media.id);
  const next = exists ? list.filter((m) => m.id !== media.id) : [media, ...list];
  watchlistStore.set(next);

  // An explicit action keeps the server idempotent even if it drifted from local state.
  syncToServer('/user/watchlist', jsonPost({ media, action: exists ? 'remove' : 'add' }));
  return !exists;
}

export async function getWatchHistory(): Promise<WatchHistoryItem[]> {
  const local = historyStore.get();
  if (local.length > 0) return local;
  try {
    const data = await fetchSafeJson(`${API_BASE}/user/history`);
    if (Array.isArray(data.history) && data.history.length > 0) {
      const hydrated = data.history.slice(0, MAX_HISTORY_ITEMS);
      historyStore.set(hydrated);
      return hydrated;
    }
  } catch {
    /* backend unavailable */
  }
  return local;
}

export function getLastWatched(anilistId: number, franchiseIds?: number[]): WatchHistoryItem | null {
  const history = historyStore.get();
  if (history.length === 0) return null;

  if (franchiseIds && franchiseIds.length > 0) {
    const franchiseMatch = history.find((h) => franchiseIds.includes(h.anilistId));
    if (franchiseMatch) return franchiseMatch;
  }
  return history.find((h) => h.anilistId === anilistId) || null;
}

/**
 * Robust season detector for AnimeMedia
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function detectSeasonNumber(media: any): number {
  if (!media) return 1;
  if (typeof media.seasonNumber === 'number' && media.seasonNumber > 0) {
    return media.seasonNumber;
  }

  const titles: string[] = [
    media.title?.english,
    media.title?.romaji,
    media.title?.userPreferred,
    typeof media.title === 'string' ? media.title : ''
  ].filter(Boolean);

  for (const t of titles) {
    // 1. Explicit Season X (e.g. 'Season 3', 'Season 2', 'S2', 'S3')
    const matchExplicit = t.match(/\b(?:Season|S)\s*(\d+)\b/i);
    if (matchExplicit) return parseInt(matchExplicit[1], 10);

    // 2. Ordinal Season (e.g. '2nd Season', '3rd Season', '4th Season')
    const matchOrdinal = t.match(/\b(\d+)(?:st|nd|rd|th)\s*Season\b/i);
    if (matchOrdinal) return parseInt(matchOrdinal[1], 10);

    // 3. Final Season
    if (/\bfinal\s*season\b/i.test(t)) return 4;

    // 4. Roman numerals: e.g. 'Mob Psycho 100 III', 'Overlord IV'
    const matchRoman = t.match(/\b(?:Season\s*)?(VII|VI|IV|V|III|II)\b/i);
    if (matchRoman) {
      const romanMap: Record<string, number> = { II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };
      const val = romanMap[matchRoman[1].toUpperCase()];
      if (val) return val;
    }

    // 5. Title ends with number: e.g. 'KonoSuba 3', 'Kingdom 5'
    const matchEndNum = t.match(/\b([2-9])\s*(?::|$)/);
    if (matchEndNum && !/\b(?:20\d\d|19\d\d)\b/.test(t)) {
      return parseInt(matchEndNum[1], 10);
    }

    // 6. Known Demon Slayer arcs
    if (/swordsmith\s*village|katanakaji/i.test(t)) return 4;
    if (/entertainment\s*district|yukaku/i.test(t)) return 3;
    if (/hashira\s*training|hashira\s*geiko/i.test(t)) return 5;
    if (/mugen\s*train|mugen\s*ressha/i.test(t)) return 2;
    if (/thousand-year\s*blood\s*war/i.test(t)) return 2;
  }

  // Fallback: check prequels count in relations if available
  if (media.relations?.edges) {
    let prequelCount = 0;
    for (const edge of media.relations.edges) {
      if (edge.relationType === 'PREQUEL') prequelCount++;
    }
    if (prequelCount > 0) return prequelCount + 1;
  }

  return 1;
}

export function getContinuePlayUrl(
  media: AnimeMedia,
  franchiseIds?: number[]
): {
  url: string;
  label: string;
  seasonNumber: number;
  episodeNumber: number;
  lastWatched: WatchHistoryItem | null;
} {
  if (media.format === 'MOVIE') {
    return {
      url: getWatchUrl(media, 1, 1),
      label: 'WATCH MOVIE',
      seasonNumber: 1,
      episodeNumber: 1,
      lastWatched: null
    };
  }

  const detectedSeason = media.seasonNumber || detectSeasonNumber(media);
  const lastWatched = getLastWatched(media.id, franchiseIds);

  if (lastWatched) {
    const sNum = lastWatched.seasonNumber || detectedSeason;
    const seasonStr = sNum > 1 ? `S${sNum} ` : '';
    return {
      url: getWatchUrl(lastWatched.media || media, sNum, lastWatched.episodeNumber),
      label: `CONTINUE ${seasonStr}E${lastWatched.episodeNumber}`,
      seasonNumber: sNum,
      episodeNumber: lastWatched.episodeNumber,
      lastWatched
    };
  }

  return {
    url: getWatchUrl(media, detectedSeason, 1),
    label: `WATCH S${detectedSeason} E1`,
    seasonNumber: detectedSeason,
    episodeNumber: 1,
    lastWatched: null
  };
}

export async function recordHistory(
  anilistId: number,
  episodeNumber: number,
  progressSeconds: number = 0,
  totalSeconds: number = 1440,
  media?: AnimeMedia,
  seasonNumber: number = 1
): Promise<void> {
  const history = historyStore.get();
  const previous = history.find((h) => h.anilistId === anilistId);

  // Skip redundant writes (e.g. re-renders or StrictMode re-running effects).
  if (previous && previous.episodeNumber === episodeNumber && history[0] === previous) {
    return;
  }

  const item: WatchHistoryItem = {
    anilistId,
    episodeNumber,
    seasonNumber,
    progressSeconds,
    totalSeconds,
    watchedAt: new Date().toISOString(),
    media: media || previous?.media
  };

  // Most recently watched always goes first so "Continue Watching" is ordered correctly.
  historyStore.set([item, ...history.filter((h) => h.anilistId !== anilistId)].slice(0, MAX_HISTORY_ITEMS));

  syncToServer(
    '/user/history',
    jsonPost({ anilistId, episodeNumber, seasonNumber, progressSeconds, totalSeconds, media })
  );
}

export async function clearWatchHistory(): Promise<void> {
  historyStore.set([]);
  syncToServer('/user/history', { method: 'DELETE' });
}

export async function removeHistoryItem(anilistId: number): Promise<void> {
  historyStore.set(historyStore.get().filter((h) => h.anilistId !== anilistId));
  syncToServer(`/user/history/${anilistId}`, { method: 'DELETE' });
}
