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
 * Robust title-based season detection helper
 */
export function detectSeasonFromTitle(titleStr?: string | null): number | null {
  if (!titleStr || typeof titleStr !== 'string') return null;
  const t = titleStr.trim();

  // 1. Explicit Season X (e.g. 'Season 3', 'Season 2', 'S2', 'S3')
  const matchExplicit = t.match(/\b(?:Season|S)\s*(\d+)\b/i);
  if (matchExplicit) return parseInt(matchExplicit[1], 10);

  // 2. Ordinal Season (e.g. '2nd Season', '3rd Season', '4th Season')
  const matchOrdinal = t.match(/\b(\d+)(?:st|nd|rd|th)\s*Season\b/i);
  if (matchOrdinal) return parseInt(matchOrdinal[1], 10);

  // 3. Final Season
  if (/\bfinal\s*season\b/i.test(t)) return 4;

  // 4. Roman numerals
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

  return null;
}

/**
 * Universal season number detector for AnimeMedia items
 */
export function detectSeasonNumber(media: any): number {
  if (!media) return 1;
  if (typeof media.seasonNumber === 'number' && media.seasonNumber > 0) return media.seasonNumber;
  const title = media.title?.english || media.title?.romaji || media.title?.userPreferred || (typeof media.title === 'string' ? media.title : '');
  const fromTitle = detectSeasonFromTitle(title);
  if (fromTitle) return fromTitle;
  if (media.relations?.edges) {
    let prequelCount = 0;
    for (const edge of media.relations.edges) {
      if (edge.relationType === 'PREQUEL') prequelCount++;
    }
    if (prequelCount > 0) return prequelCount + 1;
  }
  return 1;
}

/**
 * Real-time conversion: AniList ID -> TMDb ID / IMDb ID
 * Queries live real-time conversion endpoints on demand with zero static mapping files.
 */
export async function convertAniListToTMDbRealtime(
  anilistId: number,
  malId?: number | null,
  title?: string | null
): Promise<CrosswalkResult | null> {
  const numericId = Number(anilistId);
  if (!numericId) return null;

  if (realtimeCache.has(numericId)) {
    return realtimeCache.get(numericId)!;
  }

  let tmdbId: string | number | null = null;
  let imdbId: string | null = null;
  let season = 1;
  let offset = 0;

  // 1. Primary: Real-time query via ani.zip API
  let aniZipSeason: number | null = null;
  try {
    const res = await fetch(`https://api.ani.zip/mappings?anilist_id=${numericId}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.mappings) {
        tmdbId = data.mappings.themoviedb_id || null;
        imdbId = data.mappings.imdb_id || null;
      }
      if (data?.episodes) {
        const ep1 = data.episodes['1'] || (Object.values(data.episodes)[0] as any);
        if (ep1 && typeof ep1.seasonNumber === 'number' && ep1.seasonNumber > 0) {
          aniZipSeason = ep1.seasonNumber;
        }
      }
    }
  } catch (err) {
    console.warn('[Realtime Crosswalk] ani.zip query notice:', err);
  }

  // 2. Secondary: Real-time query via ARM API (Anime Relations Mapping)
  let armSeason: number | null = null;
  let armOffset: number | null = null;
  try {
    const res = await fetch(`https://arm.haglund.dev/api/v2/ids?source=anilist&id=${numericId}`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        if (!tmdbId && data.themoviedb) tmdbId = Number(data.themoviedb);
        if (!imdbId && data.imdb) imdbId = data.imdb;
        if (data['themoviedb-season']) armSeason = Number(data['themoviedb-season']);
        else if (data['thetvdb-season']) armSeason = Number(data['thetvdb-season']);
        if (data['themoviedb-episode']) armOffset = Number(data['themoviedb-episode']);
      }
    }
  } catch (err) {
    console.warn('[Realtime Crosswalk] ARM query notice:', err);
  }

  // 3. Tertiary: Try via MyAnimeList ID on ARM if available
  if ((!tmdbId || !imdbId) && malId) {
    try {
      const res = await fetch(`https://arm.haglund.dev/api/v2/ids?source=myanimelist&id=${malId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (!tmdbId && data.themoviedb) tmdbId = Number(data.themoviedb);
          if (!imdbId && data.imdb) imdbId = data.imdb;
          if (!armSeason) {
            armSeason = data['themoviedb-season'] ? Number(data['themoviedb-season']) : (data['thetvdb-season'] ? Number(data['thetvdb-season']) : null);
          }
        }
      }
    } catch (err) {
      console.warn('[Realtime Crosswalk] MAL ARM fallback notice:', err);
    }
  }

  // Compute canonical season
  const titleSeason = detectSeasonFromTitle(title);
  if (armSeason && armSeason > 1) {
    season = armSeason;
  } else if (aniZipSeason && aniZipSeason > 1) {
    season = aniZipSeason;
  } else if (titleSeason && titleSeason > 1) {
    season = titleSeason;
  }

  if (armOffset) {
    offset = armOffset;
  }

  if (tmdbId || imdbId) {
    const result: CrosswalkResult = {
      tmdbId,
      imdbId,
      season: season || 1,
      offset: offset || 0
    };
    realtimeCache.set(numericId, result);
    return result;
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
  malId?: number | null,
  title?: string | null
): Promise<MirrorBoxStream> {
  const isMovie = format === 'MOVIE';
  const mapping = await convertAniListToTMDbRealtime(anilistId, malId, title);

  const tmdbId = mapping?.tmdbId || null;
  const imdbId = mapping?.imdbId || null;
  const season = isMovie ? 1 : (mapping?.season || 1);
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
