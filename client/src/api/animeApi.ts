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
    const isMovie = format === 'MOVIE';
    return {
      provider: 'mirrorbox',
      mediaType: isMovie ? 'movie' : 'tv',
      externalId: String(anilistId),
      resolvedSeason: 1,
      resolvedEpisode: episode,
      embedUrl: isMovie
        ? `https://mirrorboxapi.web.app/movie/${anilistId}`
        : `https://mirrorboxapi.web.app/tv/${anilistId}/1/${episode}`,
      downloadUrl: isMovie
        ? `https://mirrorboxapi.web.app/download/movie/${anilistId}`
        : `https://mirrorboxapi.web.app/download/tv/${anilistId}/1/${episode}`,
      availableServers: ['Abyss', 'FileMoon', 'Vidmoly', 'Streamwish']
    };
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

export async function recordHistory(
  anilistId: number,
  episodeNumber: number,
  progressSeconds: number = 0,
  totalSeconds: number = 1440,
  media?: AnimeMedia
): Promise<void> {
  try {
    await fetch(`${API_BASE}/user/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anilistId,
        episodeNumber,
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
  const idx = history.findIndex(h => h.anilistId === anilistId);
  const item: WatchHistoryItem = {
    anilistId,
    episodeNumber,
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
