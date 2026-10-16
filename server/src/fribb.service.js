import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const CACHE_FILE = path.join(DATA_DIR, 'anime-list-full.json');

const AVAILABLE_SERVERS = [
  'Abyss',
  'FileMoon',
  'Vidmoly',
  'EarnVids',
  'Streamwish',
  'UpnShare',
  'RpmShare'
];

class FribbService {
  constructor() {
    this.anilistIndex = new Map();
    this.malIndex = new Map();
    this.isLoaded = false;
    this.isLoading = false;
  }

  async init() {
    if (this.isLoaded || this.isLoading) return;
    this.isLoading = true;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      let data = null;
      if (fs.existsSync(CACHE_FILE)) {
        try {
          const stats = fs.statSync(CACHE_FILE);
          // If file is less than 7 days old and has size > 100KB, use it
          const ageDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
          if (ageDays < 7 && stats.size > 100000) {
            console.log('[FribbService] Loading anime crosswalk from local cache...');
            const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
            data = JSON.parse(raw);
          }
        } catch (err) {
          console.warn('[FribbService] Local cache read error, will download fresh:', err.message);
        }
      }

      if (!data) {
        console.log('[FribbService] Downloading anime-list-full.json from GitHub (Fribb/anime-lists)...');
        const res = await fetch('https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json', {
          headers: { 'User-Agent': 'Animora/1.0' }
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch Fribb list: ${res.statusText}`);
        }
        data = await res.json();
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
        console.log(`[FribbService] Saved fresh crosswalk dataset (${data.length} records) to disk.`);
      }

      for (const item of data) {
        if (item.anilist_id) {
          this.anilistIndex.set(Number(item.anilist_id), item);
        }
        if (item.mal_id) {
          this.malIndex.set(Number(item.mal_id), item);
        }
      }

      this.isLoaded = true;
      console.log(`[FribbService] Indexed ${this.anilistIndex.size} AniList entries for instantaneous Mirror-Box resolution.`);
    } catch (err) {
      console.error('[FribbService] Failed to load crosswalk index:', err.message);
    } finally {
      this.isLoading = false;
    }
  }

  resolve(anilistId, episodeNumber = 1, format = 'TV', malId = null) {
    const id = Number(anilistId);
    let record = this.anilistIndex.get(id);

    if (!record && malId) {
      record = this.malIndex.get(Number(malId));
    }

    const isMovie = format === 'MOVIE' || record?.type === 'MOVIE';

    // Movie resolution
    if (isMovie) {
      let movieId = null;
      if (record?.themoviedb_id) {
        if (typeof record.themoviedb_id === 'object' && record.themoviedb_id.movie) {
          movieId = Array.isArray(record.themoviedb_id.movie)
            ? record.themoviedb_id.movie[0]
            : record.themoviedb_id.movie;
        } else if (typeof record.themoviedb_id === 'number') {
          movieId = record.themoviedb_id;
        }
      }
      if (!movieId && record?.imdb_id) {
        movieId = Array.isArray(record.imdb_id) ? record.imdb_id[0] : record.imdb_id;
      }

      // Fallback ID if not found
      if (!movieId) {
        movieId = id; // best-effort fallback
      }

      return {
        provider: 'mirrorbox',
        mediaType: 'movie',
        externalId: String(movieId),
        resolvedSeason: null,
        resolvedEpisode: null,
        embedUrl: `https://mirrorboxapi.web.app/movie/${movieId}`,
        downloadUrl: `https://mirrorboxapi.web.app/download/movie/${movieId}`,
        availableServers: AVAILABLE_SERVERS,
        isMapped: Boolean(record)
      };
    }

    // TV / Series resolution
    let tvId = null;
    if (record?.themoviedb_id) {
      if (typeof record.themoviedb_id === 'object' && record.themoviedb_id.tv) {
        tvId = Array.isArray(record.themoviedb_id.tv)
          ? record.themoviedb_id.tv[0]
          : record.themoviedb_id.tv;
      } else if (typeof record.themoviedb_id === 'number') {
        tvId = record.themoviedb_id;
      }
    }
    if (!tvId && record?.imdb_id) {
      tvId = Array.isArray(record.imdb_id) ? record.imdb_id[0] : record.imdb_id;
    }

    const season = (record?.season && typeof record.season.tmdb === 'number')
      ? record.season.tmdb
      : 1;

    const offset = (record?.episode_offset && typeof record.episode_offset.tmdb === 'number')
      ? record.episode_offset.tmdb
      : 0;

    const resolvedEpisode = Math.max(1, (Number(episodeNumber) || 1) + offset);
    const resolvedTvId = tvId || String(id);

    return {
      provider: 'mirrorbox',
      mediaType: 'tv',
      externalId: String(resolvedTvId),
      resolvedSeason: season,
      resolvedEpisode: resolvedEpisode,
      embedUrl: `https://mirrorboxapi.web.app/tv/${resolvedTvId}/${season}/${resolvedEpisode}`,
      downloadUrl: `https://mirrorboxapi.web.app/download/tv/${resolvedTvId}/${season}/${resolvedEpisode}`,
      availableServers: AVAILABLE_SERVERS,
      isMapped: Boolean(record && tvId)
    };
  }
}

export const fribbService = new FribbService();
