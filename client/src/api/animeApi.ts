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

const API_BASE = '/api/v1';

async function fetchSafeJson(url: string) {
  const res = await fetch(url);
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    throw new Error(`Invalid response: ${res.status}`);
  }
  return res.json();
}

export async function fetchHomeCatalog(): Promise<HomeCatalogResponse> {
  try {
    return await fetchSafeJson(`${API_BASE}/anime/home`);
  } catch (err) {
    console.warn('Backend home catalog unreachable, falling back to direct AniList GraphQL:', err);
    return await clientFetchHomeCatalog();
  }
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

export async function fetchBrowse(params: BrowseParams = {}): Promise<BrowseResponse> {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.perPage) query.set('perPage', String(params.perPage));
    if (params.search) query.set('search', params.search);
    if (params.genre) query.set('genre', params.genre);
    if (params.format) query.set('format', params.format);
    if (params.season) query.set('season', params.season);
    if (params.seasonYear) query.set('seasonYear', String(params.seasonYear));
    if (params.status) query.set('status', params.status);
    if (params.sort) query.set('sort', params.sort);

    return await fetchSafeJson(`${API_BASE}/anime/browse?${query.toString()}`);
  } catch (err) {
    console.warn('Backend browse unreachable, falling back to direct AniList GraphQL:', err);
    return await clientFetchBrowse(params);
  }
}

export interface AnimeDetailResponse {
  media: AnimeMedia;
  episodes: EpisodeItemDTO[];
  franchiseSeasons: FranchiseSeasonNode[];
}

export async function fetchAnimeDetail(id: string | number): Promise<AnimeDetailResponse> {
  try {
    return await fetchSafeJson(`${API_BASE}/anime/${id}`);
  } catch (err) {
    console.warn('Backend detail unreachable, falling back to direct AniList GraphQL:', err);
    return await clientFetchAnimeDetail(String(id));
  }
}

export async function fetchCalendar(startUnix?: number, endUnix?: number): Promise<{ schedules: AiringScheduleItem[] }> {
  try {
    const query = new URLSearchParams();
    if (startUnix) query.set('startUnix', String(startUnix));
    if (endUnix) query.set('endUnix', String(endUnix));

    return await fetchSafeJson(`${API_BASE}/anime/calendar?${query.toString()}`);
  } catch (err) {
    console.warn('Backend calendar unreachable, falling back to direct AniList GraphQL:', err);
    const date = startUnix ? new Date(startUnix * 1000) : new Date();
    const schedules = await clientFetchCalendar(date.getFullYear(), date.getMonth() + 1);
    return { schedules };
  }
}

export async function resolveStream(
  anilistId: number,
  episode: number = 1,
  format: string = 'TV',
  malId?: number | null
): Promise<MirrorBoxStream> {
  try {
    const query = new URLSearchParams({
      episode: String(episode),
      format
    });
    if (malId) query.set('malId', String(malId));

    return await fetchSafeJson(`${API_BASE}/stream/resolve/${anilistId}?${query.toString()}`);
  } catch (err) {
    return await resolveCrosswalkStream(anilistId, episode, format, malId);
  }
}

const WATCHLIST_KEY = 'animora_watchlist';
const LEGACY_WATCHLIST_KEY = 'crunchyroll_watchlist';

const HISTORY_KEY = 'animora_history';
const LEGACY_HISTORY_KEY = 'crunchyroll_history';

// User Watchlist & History API
export async function getWatchlist(): Promise<AnimeMedia[]> {
  try {
    const res = await fetch(`${API_BASE}/user/watchlist`);
    if (res.ok) {
      const data = await res.json();
      return data.watchlist || [];
    }
  } catch (e) {
    console.warn('Backend watchlist fetch failed, falling back to local storage', e);
  }
  const local = localStorage.getItem(WATCHLIST_KEY) || localStorage.getItem(LEGACY_WATCHLIST_KEY);
  return local ? JSON.parse(local) : [];
}

export async function toggleWatchlist(media: AnimeMedia): Promise<boolean> {
  // Sync to backend & localStorage
  let isAdded = false;
  try {
    const res = await fetch(`${API_BASE}/user/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media })
    });
    if (res.ok) {
      const data = await res.json();
      isAdded = data.added;
    }
  } catch (e) {
    console.warn('Backend watchlist toggle failed', e);
  }

  // Also update localStorage
  const local = localStorage.getItem(WATCHLIST_KEY) || localStorage.getItem(LEGACY_WATCHLIST_KEY);
  let list: AnimeMedia[] = local ? JSON.parse(local) : [];
  const idx = list.findIndex(m => m.id === media.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    isAdded = false;
  } else {
    list.unshift(media);
    isAdded = true;
  }
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  localStorage.removeItem(LEGACY_WATCHLIST_KEY);
  window.dispatchEvent(new Event('watchlist_updated'));
  return isAdded;
}

export interface WatchHistoryItem {
  anilistId: number;
  episodeNumber: number;
  seasonNumber?: number;
  progressSeconds: number;
  totalSeconds: number;
  watchedAt: string;
  media?: AnimeMedia;
}

export async function getWatchHistory(): Promise<WatchHistoryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/user/history`);
    if (res.ok) {
      const data = await res.json();
      return data.history || [];
    }
  } catch (e) {
    console.warn('History fetch fallback', e);
  }
  const local = localStorage.getItem(HISTORY_KEY) || localStorage.getItem(LEGACY_HISTORY_KEY);
  return local ? JSON.parse(local) : [];
}

export function getLastWatched(anilistId: number, franchiseIds?: number[]): WatchHistoryItem | null {
  try {
    const local = localStorage.getItem(HISTORY_KEY) || localStorage.getItem(LEGACY_HISTORY_KEY);
    if (!local) return null;
    const history: WatchHistoryItem[] = JSON.parse(local);
    if (!Array.isArray(history) || history.length === 0) return null;

    if (franchiseIds && franchiseIds.length > 0) {
      const franchiseMatch = history.find((h) => franchiseIds.includes(h.anilistId));
      if (franchiseMatch) return franchiseMatch;
    }

    return history.find((h) => h.anilistId === anilistId) || null;
  } catch {
    return null;
  }
}

/**
 * Robust season detector for AnimeMedia
 */
export function detectSeasonNumber(media: any): number {
  if (!media) return 1;
  if (typeof media.seasonNumber === 'number' && media.seasonNumber > 0) {
    return media.seasonNumber;
  }

  const titles = [
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
  const isMovie = media.format === 'MOVIE';
  if (isMovie) {
    return {
      url: `/watch/${media.id}`,
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
      url: `/watch/${lastWatched.anilistId}/ep/${lastWatched.episodeNumber}`,
      label: `CONTINUE ${seasonStr}E${lastWatched.episodeNumber}`,
      seasonNumber: sNum,
      episodeNumber: lastWatched.episodeNumber,
      lastWatched
    };
  }

  return {
    url: `/watch/${media.id}/ep/1`,
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
  try {
    await fetch(`${API_BASE}/user/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anilistId,
        episodeNumber,
        seasonNumber,
        progressSeconds,
        totalSeconds,
        media
      })
    });
  } catch (e) {
    console.warn('History save fallback', e);
  }

  const local = localStorage.getItem(HISTORY_KEY) || localStorage.getItem(LEGACY_HISTORY_KEY);
  let history: WatchHistoryItem[] = local ? JSON.parse(local) : [];
  const idx = history.findIndex((h) => h.anilistId === anilistId);
  const item: WatchHistoryItem = {
    anilistId,
    episodeNumber,
    seasonNumber,
    progressSeconds,
    totalSeconds,
    watchedAt: new Date().toISOString(),
    media: media || (idx >= 0 ? history[idx].media : undefined)
  };
  if (idx >= 0) {
    history[idx] = item;
  } else {
    history.unshift(item);
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
  localStorage.removeItem(LEGACY_HISTORY_KEY);
  window.dispatchEvent(new Event('history_updated'));
}

export async function clearWatchHistory(): Promise<void> {
  try {
    await fetch(`${API_BASE}/user/history`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn('Backend clear history failed', e);
  }
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(LEGACY_HISTORY_KEY);
  window.dispatchEvent(new Event('history_updated'));
}

export async function removeHistoryItem(anilistId: number): Promise<void> {
  try {
    await fetch(`${API_BASE}/user/history/${anilistId}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn('Backend remove history item failed', e);
  }
  const local = localStorage.getItem(HISTORY_KEY) || localStorage.getItem(LEGACY_HISTORY_KEY);
  if (local) {
    const history: WatchHistoryItem[] = JSON.parse(local);
    const updated = history.filter(h => h.anilistId !== anilistId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    localStorage.removeItem(LEGACY_HISTORY_KEY);
  }
  window.dispatchEvent(new Event('history_updated'));
}
