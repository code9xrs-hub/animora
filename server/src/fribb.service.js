import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRIBB_DATA_FILE = path.join(__dirname, '..', 'data', 'fribb-mini.json');
const FRIBB_REMOTE_URL = 'https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-mini.json';

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
 * Robust title-based season detection fallback
 */
export function detectSeasonFromTitle(titleStr) {
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
    const romanMap = { II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };
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

class RealtimeCrosswalkService {
  constructor() {
    this.cache = new Map();
    this.fribbMap = new Map();
    this.isLoaded = false;
  }

  async init() {
    try {
      if (fs.existsSync(FRIBB_DATA_FILE)) {
        const raw = fs.readFileSync(FRIBB_DATA_FILE, 'utf-8');
        const list = JSON.parse(raw);
        for (const item of list) {
          if (item && item.anilist_id) {
            this.fribbMap.set(Number(item.anilist_id), item);
          }
        }
        this.isLoaded = true;
        console.log(`[RealtimeCrosswalk] Loaded ${this.fribbMap.size} canonical mappings from local Fribb index.`);
      } else {
        // Download in background
        this.downloadFribbIndex().catch(() => {});
      }
    } catch (e) {
      console.warn('[RealtimeCrosswalk] Local index load warning:', e.message);
      this.downloadFribbIndex().catch(() => {});
    }
  }

  async downloadFribbIndex() {
    try {
      console.log('[RealtimeCrosswalk] Fetching Fribb anime index from GitHub...');
      const res = await fetch(FRIBB_REMOTE_URL, { headers: { 'User-Agent': 'Animora/1.0' } });
      if (!res.ok) return;
      const text = await res.text();
      const list = JSON.parse(text);
      for (const item of list) {
        if (item && item.anilist_id) {
          this.fribbMap.set(Number(item.anilist_id), item);
        }
      }
      this.isLoaded = true;
      const dir = path.dirname(FRIBB_DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(FRIBB_DATA_FILE, text);
      console.log(`[RealtimeCrosswalk] Successfully cached ${this.fribbMap.size} mappings locally.`);
    } catch (err) {
      console.warn('[RealtimeCrosswalk] Background Fribb index fetch warning:', err.message);
    }
  }

  async getMapping(anilistId, malId = null, title = null) {
    const id = Number(anilistId);
    if (!id) return null;

    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    let tmdbId = null;
    let imdbId = null;
    let season = 1;
    let offset = 0;
    let mediaType = 'TV';

    // 1. Check local Fribb canonical database
    const fribbItem = this.fribbMap.get(id);
    if (fribbItem) {
      if (fribbItem.themoviedb_id) {
        if (typeof fribbItem.themoviedb_id === 'object') {
          tmdbId = fribbItem.themoviedb_id.tv || fribbItem.themoviedb_id.movie || null;
        } else {
          tmdbId = fribbItem.themoviedb_id;
        }
      }
      if (fribbItem.imdb_id) {
        if (Array.isArray(fribbItem.imdb_id) && fribbItem.imdb_id.length > 0) {
          imdbId = fribbItem.imdb_id[0];
        } else if (typeof fribbItem.imdb_id === 'string') {
          imdbId = fribbItem.imdb_id;
        }
      }
      if (fribbItem.season) {
        if (typeof fribbItem.season === 'object') {
          season = fribbItem.season.tmdb || fribbItem.season.tvdb || 1;
        } else if (typeof fribbItem.season === 'number') {
          season = fribbItem.season;
        }
      }
      if (fribbItem.episode_offset) {
        if (typeof fribbItem.episode_offset === 'object') {
          offset = fribbItem.episode_offset.tmdb || fribbItem.episode_offset.tvdb || 0;
        } else if (typeof fribbItem.episode_offset === 'number') {
          offset = fribbItem.episode_offset;
        }
      }
      if (fribbItem.type) {
        mediaType = fribbItem.type;
      }
    }

    // 2. Query live ani.zip API for real-time mappings & episode season info
    let aniZipSeason = null;
    try {
      const res = await fetch(`https://api.ani.zip/mappings?anilist_id=${id}`, {
        headers: { 'User-Agent': 'Animora/1.0' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.mappings) {
          if (!tmdbId && data.mappings.themoviedb_id) {
            tmdbId = data.mappings.themoviedb_id;
          }
          if (!imdbId && data.mappings.imdb_id) {
            imdbId = data.mappings.imdb_id;
          }
          if (data.mappings.type) {
            mediaType = data.mappings.type;
          }
        }
        if (data?.episodes) {
          const ep1 = data.episodes['1'] || Object.values(data.episodes)[0];
          if (ep1 && typeof ep1.seasonNumber === 'number' && ep1.seasonNumber > 0) {
            aniZipSeason = ep1.seasonNumber;
          }
        }
      }
    } catch (e) {
      // Non-fatal warning
    }

    // 3. Query ARM API (Anime Relations Mapping)
    let armSeason = null;
    let armOffset = null;
    try {
      const res = await fetch(`https://arm.haglund.dev/api/v2/ids?source=anilist&id=${id}`, {
        headers: { 'User-Agent': 'Animora/1.0' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (!tmdbId && data.themoviedb) tmdbId = data.themoviedb;
          if (!imdbId && data.imdb) imdbId = data.imdb;
          if (data['themoviedb-season']) armSeason = Number(data['themoviedb-season']);
          else if (data['thetvdb-season']) armSeason = Number(data['thetvdb-season']);
          if (data['themoviedb-episode']) armOffset = Number(data['themoviedb-episode']);
        }
      }
    } catch (e) {
      // Non-fatal warning
    }

    // 4. MAL ID fallback on ARM if IDs still missing
    if ((!tmdbId || !imdbId) && malId) {
      try {
        const res = await fetch(`https://arm.haglund.dev/api/v2/ids?source=myanimelist&id=${malId}`, {
          headers: { 'User-Agent': 'Animora/1.0' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (!tmdbId && data.themoviedb) tmdbId = data.themoviedb;
            if (!imdbId && data.imdb) imdbId = data.imdb;
            if (!armSeason) {
              armSeason = data['themoviedb-season'] ? Number(data['themoviedb-season']) : (data['thetvdb-season'] ? Number(data['thetvdb-season']) : null);
            }
          }
        }
      } catch (e) {
        // Non-fatal warning
      }
    }

    // 5. Compute canonical season:
    // Priority: ARM explicit TMDb season > ani.zip episode seasonNumber > Fribb tmdb/tvdb season > title detection > 1
    const titleSeason = detectSeasonFromTitle(title);
    if (armSeason && armSeason > 1) {
      season = armSeason;
    } else if (aniZipSeason && aniZipSeason > 1) {
      season = aniZipSeason;
    } else if (season <= 1 && titleSeason && titleSeason > 1) {
      season = titleSeason;
    }

    if (armOffset && offset === 0) {
      offset = armOffset;
    }

    const result = {
      tmdbId: tmdbId ? String(tmdbId) : null,
      imdbId: imdbId || null,
      type: mediaType,
      season: season || 1,
      offset: offset || 0
    };

    this.cache.set(id, result);
    return result;
  }

  buildStream(anilistId, episodeNumber = 1, format = 'TV', mapping = null) {
    const id = Number(anilistId);
    const isMovie = format === 'MOVIE' || mapping?.type === 'MOVIE';

    const tmdbId = mapping?.tmdbId || null;
    const imdbId = mapping?.imdbId || null;
    const season = isMovie ? 1 : (mapping?.season || 1);
    const offset = mapping?.offset || 0;

    // Prioritize TMDb ID, then IMDb ID, fallback to numeric AniList ID
    const externalId = String(tmdbId || imdbId || id);
    const resolvedEpisode = Math.max(1, (Number(episodeNumber) || 1) + offset);

    if (isMovie) {
      return {
        provider: 'mirrorbox',
        mediaType: 'movie',
        externalId,
        resolvedSeason: 1,
        resolvedEpisode: 1,
        embedUrl: `https://mirrorboxapi.web.app/movie/${externalId}`,
        downloadUrl: `https://mirrorboxapi.web.app/download/movie/${externalId}`,
        availableServers: AVAILABLE_SERVERS,
        isMapped: Boolean(tmdbId || imdbId)
      };
    }

    return {
      provider: 'mirrorbox',
      mediaType: 'tv',
      externalId,
      resolvedSeason: season,
      resolvedEpisode,
      embedUrl: `https://mirrorboxapi.web.app/tv/${externalId}/${season}/${resolvedEpisode}`,
      downloadUrl: `https://mirrorboxapi.web.app/download/tv/${externalId}/${season}/${resolvedEpisode}`,
      availableServers: AVAILABLE_SERVERS,
      isMapped: Boolean(tmdbId || imdbId)
    };
  }

  async resolve(anilistId, episodeNumber = 1, format = 'TV', malId = null, title = null) {
    const mapping = await this.getMapping(anilistId, malId, title);
    return this.buildStream(anilistId, episodeNumber, format, mapping);
  }
}

export const fribbService = new RealtimeCrosswalkService();
