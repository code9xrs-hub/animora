/**
 * URL Slug Utilities for Semantic Anime Routing
 * Series format: /series/:title-:seasonx:episode (e.g. /series/solo-leveling-1x1)
 * Movie format: /movie/:title/:year (e.g. /movie/your-name/2016)
 * Watch format: /watch/:title-:seasonx:episode or /watch/:title/:year
 */

const memorySlugMap = new Map<string, number>();

export function slugify(text: string): string {
  if (!text) return 'anime';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')    // remove non-alphanumeric except space and hyphen
    .trim()
    .replace(/\s+/g, '-')            // collapse whitespace to hyphens
    .replace(/-+/g, '-');            // collapse multiple hyphens
}

export function getAnimeTitle(media: {
  title?: { english?: string | null; romaji?: string | null; userPreferred?: string | null } | string;
}): string {
  if (!media) return 'anime';
  if (typeof media.title === 'string') return media.title;
  return media.title?.english || media.title?.romaji || media.title?.userPreferred || 'anime';
}

export function buildSeriesDetailSlug(title: string, season: number = 1): string {
  let cleanSlug = slugify(title);
  const s = Math.max(1, Math.floor(season || 1));
  cleanSlug = cleanSlug.replace(/-season-\d+$/i, '').replace(/-\d+x\d+$/i, '');
  return `${cleanSlug}-season-${s}`;
}

export function buildSeriesSlug(title: string, season: number = 1, episode: number = 1): string {
  let cleanSlug = slugify(title);
  const s = Math.max(1, Math.floor(season || 1));
  const ep = Math.max(1, Math.floor(episode || 1));
  cleanSlug = cleanSlug.replace(/-season-\d+$/i, '').replace(/-\d+x\d+$/i, '');
  return `${cleanSlug}-${s}x${ep}`;
}

export function buildMovieSlug(title: string): string {
  return slugify(title);
}

export function getAnimeUrl(
  media: {
    id: number;
    title?: any;
    format?: string;
    seasonYear?: number | null;
    startDate?: { year?: number | null } | null;
    seasonNumber?: number;
  },
  season: number = 1
): string {
  if (!media) return '/browse';
  const isMovie = media.format === 'MOVIE';
  const title = getAnimeTitle(media);

  if (isMovie) {
    const year = media.seasonYear || media.startDate?.year || new Date().getFullYear();
    const slug = buildMovieSlug(title);
    cacheSlugId(slug, media.id);
    cacheSlugId(`${slug}-${year}`, media.id);
    return `/movie/${slug}/${year}`;
  }

  const s = media.seasonNumber || season || 1;
  const seriesSlug = buildSeriesDetailSlug(title, s);
  cacheSlugId(seriesSlug, media.id);
  cacheSlugId(slugify(title), media.id);
  return `/series/${seriesSlug}`;
}

export function getWatchUrl(
  media: {
    id: number;
    title?: any;
    format?: string;
    seasonYear?: number | null;
    startDate?: { year?: number | null } | null;
    seasonNumber?: number;
  },
  season: number = 1,
  episode: number = 1
): string {
  if (!media) return '/browse';
  const isMovie = media.format === 'MOVIE';
  const title = getAnimeTitle(media);

  if (isMovie) {
    const year = media.seasonYear || media.startDate?.year || new Date().getFullYear();
    const slug = buildMovieSlug(title);
    cacheSlugId(slug, media.id);
    cacheSlugId(`${slug}-${year}`, media.id);
    return `/watch/${slug}/${year}`;
  }

  const s = media.seasonNumber || season || 1;
  const ep = episode || 1;
  const seriesSlug = buildSeriesSlug(title, s, ep);
  cacheSlugId(seriesSlug, media.id);
  cacheSlugId(slugify(title), media.id);
  return `/watch/${seriesSlug}`;
}

export interface ParsedSlug {
  isNumeric: boolean;
  id?: number;
  titleSlug?: string;
  season: number;
  episode: number;
  year?: number;
  searchKeywords?: string;
}

export function parseSeriesSlug(slug: string): ParsedSlug {
  if (!slug) {
    return { isNumeric: false, season: 1, episode: 1 };
  }

  if (/^\d+$/.test(slug)) {
    return {
      isNumeric: true,
      id: parseInt(slug, 10),
      season: 1,
      episode: 1
    };
  }

  // Check for -(\d+)x(\d+)$ (Watch URL: /watch/title-1x1)
  const match1x1 = slug.match(/^(.+?)-(\d+)x(\d+)$/i);
  if (match1x1) {
    const titleSlug = match1x1[1].replace(/-season-\d+$/i, '');
    const season = Math.max(1, parseInt(match1x1[2], 10) || 1);
    const episode = Math.max(1, parseInt(match1x1[3], 10) || 1);
    return {
      isNumeric: false,
      titleSlug,
      season,
      episode,
      searchKeywords: titleSlug.replace(/-/g, ' ').trim()
    };
  }

  // Check for -season-(\d+)$ (Series detail URL: /series/title-season-1)
  const matchSeason = slug.match(/^(.+?)-season-(\d+)$/i);
  if (matchSeason) {
    const titleSlug = matchSeason[1].replace(/-\d+x\d+$/i, '');
    const season = Math.max(1, parseInt(matchSeason[2], 10) || 1);
    return {
      isNumeric: false,
      titleSlug,
      season,
      episode: 1,
      searchKeywords: titleSlug.replace(/-/g, ' ').trim()
    };
  }

  // Fallback: title without season/episode
  return {
    isNumeric: false,
    titleSlug: slug,
    season: 1,
    episode: 1,
    searchKeywords: slug.replace(/-/g, ' ').trim()
  };
}

export function parseMovieSlug(slug: string, yearParam?: string): ParsedSlug {
  if (!slug) {
    return { isNumeric: false, season: 1, episode: 1 };
  }

  if (/^\d+$/.test(slug)) {
    return {
      isNumeric: true,
      id: parseInt(slug, 10),
      season: 1,
      episode: 1,
      year: yearParam ? parseInt(yearParam, 10) : undefined
    };
  }

  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  return {
    isNumeric: false,
    titleSlug: slug,
    season: 1,
    episode: 1,
    year,
    searchKeywords: slug.replace(/-/g, ' ').trim()
  };
}

export function cacheSlugId(slug: string, id: number) {
  if (!slug || !id) return;
  const key = slug.toLowerCase();
  memorySlugMap.set(key, id);
  try {
    sessionStorage.setItem(`slug_id_${key}`, String(id));
  } catch {}
}

export function getCachedSlugId(slug: string): number | null {
  if (!slug) return null;
  const key = slug.toLowerCase();
  if (memorySlugMap.has(key)) return memorySlugMap.get(key)!;
  try {
    const stored = sessionStorage.getItem(`slug_id_${key}`);
    if (stored) {
      const id = parseInt(stored, 10);
      if (id) {
        memorySlugMap.set(key, id);
        return id;
      }
    }
  } catch {}
  return null;
}

