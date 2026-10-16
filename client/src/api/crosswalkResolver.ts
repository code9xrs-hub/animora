import { MirrorBoxStream } from '../types/anime';

// Cache structure: anilist_id -> [tmdbId, tmdbSeason, episodeOffset, imdbId]
type CrosswalkEntry = [number | string | null, number, number, string | null];

const memoryIndex = new Map<number, CrosswalkEntry>();
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

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
 * Loads the local 8,339-title pre-indexed crosswalk mapping
 */
export async function loadMappings(): Promise<void> {
  if (isLoaded) return;
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const res = await fetch('/mappings.json');
        if (res.ok) {
          const json = await res.json();
          for (const [key, val] of Object.entries(json)) {
            memoryIndex.set(Number(key), val as CrosswalkEntry);
          }
          isLoaded = true;
        }
      } catch (err) {
        console.warn('[Crosswalk] Failed to load local /mappings.json:', err);
      }
    })();
  }
  await loadPromise;
}

/**
 * Resolves an AniList media ID to TMDb / IMDb ID with season & episode offsets for Mirror-Box
 */
export async function resolveCrosswalkStream(
  anilistId: number,
  episodeNumber: number = 1,
  format: string = 'TV',
  malId?: number | null
): Promise<MirrorBoxStream> {
  const isMovie = format === 'MOVIE';

  // 1. Ensure local index is loaded
  await loadMappings();

  let entry = memoryIndex.get(Number(anilistId));

  // 2. Fallback to live ARM API if not present in pre-indexed dictionary
  if (!entry) {
    try {
      const armRes = await fetch(`https://arm.haglund.dev/api/v2/ids?source=anilist&id=${anilistId}`);
      if (armRes.ok) {
        const arm = await armRes.json();
        if (arm) {
          const tmdb = arm.themoviedb ? Number(arm.themoviedb) : null;
          const season = arm['themoviedb-season'] ? Number(arm['themoviedb-season']) : 1;
          const offset = arm['themoviedb-episode'] ? Number(arm['themoviedb-episode']) : 0;
          const imdb = arm.imdb || null;
          if (tmdb || imdb) {
            entry = [tmdb, season, offset, imdb];
            memoryIndex.set(Number(anilistId), entry);
          }
        }
      }
    } catch (e) {
      console.warn('[Crosswalk] Live ARM lookup error:', e);
    }
  }

  const tmdbId = entry ? entry[0] : null;
  const season = entry ? (Number(entry[1]) || 1) : 1;
  const offset = entry ? (Number(entry[2]) || 0) : 0;
  const imdbId = entry ? entry[3] : null;

  // Prioritize TMDb ID, then IMDb ID, fallback to AniList ID
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
