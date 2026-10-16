import { MirrorBoxStream } from '../types/anime';

interface CrosswalkResult {
  tmdbId: string | number | null;
  imdbId: string | null;
  season: number;
  offset: number;
}

// In-memory runtime session cache: anilist_id -> CrosswalkResult
const realtimeCache = new Map<number, CrosswalkResult>();

const AVAILABLE_SERVERS = [
  'Abyss',
  'FileMoon',
  'Vidmoly',
  'EarnVids',
  'Streamwish',
  'UpnShare',
  'RpmShare'
];

/**
 * Real-time conversion: AniList ID -> TMDb ID / IMDb ID
 * Queries live real-time conversion endpoints on demand with zero static mapping files.
 */
export async function convertAniListToTMDbRealtime(
  anilistId: number,
  malId?: number | null
): Promise<CrosswalkResult | null> {
  const numericId = Number(anilistId);
  if (!numericId) return null;

  if (realtimeCache.has(numericId)) {
    return realtimeCache.get(numericId)!;
  }

  // 1. Primary: Real-time query via ani.zip API
  try {
    const res = await fetch(`https://api.ani.zip/mappings?anilist_id=${numericId}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.mappings && (data.mappings.themoviedb_id || data.mappings.imdb_id)) {
        const result: CrosswalkResult = {
          tmdbId: data.mappings.themoviedb_id || null,
          imdbId: data.mappings.imdb_id || null,
          season: 1,
          offset: 0
        };
        realtimeCache.set(numericId, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('[Realtime Crosswalk] ani.zip query notice:', err);
  }

  // 2. Secondary: Real-time query via ARM API (Anime Relations Mapping)
  try {
    const res = await fetch(`https://arm.haglund.dev/api/v2/ids?source=anilist&id=${numericId}`);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.themoviedb || data.imdb)) {
        const result: CrosswalkResult = {
          tmdbId: data.themoviedb ? Number(data.themoviedb) : null,
          imdbId: data.imdb || null,
          season: data['themoviedb-season'] ? Number(data['themoviedb-season']) : 1,
          offset: data['themoviedb-episode'] ? Number(data['themoviedb-episode']) : 0
        };
        realtimeCache.set(numericId, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('[Realtime Crosswalk] ARM query notice:', err);
  }

  // 3. Tertiary: Try via MyAnimeList ID on ARM if available
  if (malId) {
    try {
      const res = await fetch(`https://arm.haglund.dev/api/v2/ids?source=myanimelist&id=${malId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.themoviedb || data.imdb)) {
          const result: CrosswalkResult = {
            tmdbId: data.themoviedb ? Number(data.themoviedb) : null,
            imdbId: data.imdb || null,
            season: data['themoviedb-season'] ? Number(data['themoviedb-season']) : 1,
            offset: data['themoviedb-episode'] ? Number(data['themoviedb-episode']) : 0
          };
          realtimeCache.set(numericId, result);
          return result;
        }
      }
    } catch (err) {
      console.warn('[Realtime Crosswalk] MAL ARM fallback notice:', err);
    }
  }

  return null;
}

/**
 * Resolves Mirror-Box stream with real-time converted TMDb / IMDb ID
 */
export async function resolveCrosswalkStream(
  anilistId: number,
  episodeNumber: number = 1,
  format: string = 'TV',
  malId?: number | null
): Promise<MirrorBoxStream> {
  const isMovie = format === 'MOVIE';
  const mapping = await convertAniListToTMDbRealtime(anilistId, malId);

  const tmdbId = mapping?.tmdbId || null;
  const imdbId = mapping?.imdbId || null;
  const season = mapping?.season || 1;
  const offset = mapping?.offset || 0;

  // Prioritize TMDb ID, then IMDb ID, fallback to AniList ID if unconverted
  const externalId = String(tmdbId || imdbId || anilistId);
  const resolvedEpisode = Math.max(1, (Number(episodeNumber) || 1) + offset);

  const embedUrl = isMovie
    ? `https://mirrorboxapi.web.app/movie/${externalId}`
    : `https://mirrorboxapi.web.app/tv/${externalId}/${season}/${resolvedEpisode}`;

  const downloadUrl = isMovie
    ? `https://mirrorboxapi.web.app/download/movie/${externalId}`
    : `https://mirrorboxapi.web.app/download/tv/${externalId}/${season}/${resolvedEpisode}`;

  return {
    provider: 'mirrorbox',
    mediaType: isMovie ? 'movie' : 'tv',
    externalId,
    resolvedSeason: isMovie ? 1 : season,
    resolvedEpisode: isMovie ? 1 : resolvedEpisode,
    embedUrl,
    downloadUrl,
    availableServers: AVAILABLE_SERVERS,
    isMapped: Boolean(tmdbId || imdbId)
  };
}
