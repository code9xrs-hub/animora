const AVAILABLE_SERVERS = [
  'Abyss',
  'FileMoon',
  'Vidmoly',
  'EarnVids',
  'Streamwish',
  'UpnShare',
  'RpmShare'
];

class RealtimeCrosswalkService {
  constructor() {
    this.cache = new Map();
  }

  async init() {
    console.log('[RealtimeCrosswalk] Real-time AniList to TMDb converter ready (zero static mapping files).');
  }

  async getMapping(anilistId, malId = null) {
    const id = Number(anilistId);
    if (!id) return null;

    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    // 1. Primary: Real-time query via ani.zip
    try {
      const res = await fetch(`https://api.ani.zip/mappings?anilist_id=${id}`, {
        headers: { 'User-Agent': 'Animora/1.0' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.mappings && (data.mappings.themoviedb_id || data.mappings.imdb_id)) {
          const mapping = {
            tmdbId: data.mappings.themoviedb_id,
            imdbId: data.mappings.imdb_id,
            type: data.mappings.type,
            season: 1,
            offset: 0
          };
          this.cache.set(id, mapping);
          return mapping;
        }
      }
    } catch (e) {
      console.warn('[RealtimeCrosswalk] ani.zip query warning:', e.message);
    }

    // 2. Secondary: Real-time query via ARM API
    try {
      const res = await fetch(`https://arm.haglund.dev/api/v2/ids?source=anilist&id=${id}`, {
        headers: { 'User-Agent': 'Animora/1.0' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.themoviedb || data.imdb)) {
          const mapping = {
            tmdbId: data.themoviedb,
            imdbId: data.imdb,
            type: data.media,
            season: data['themoviedb-season'] || 1,
            offset: data['themoviedb-episode'] || 0
          };
          this.cache.set(id, mapping);
          return mapping;
        }
      }
    } catch (e) {
      console.warn('[RealtimeCrosswalk] ARM API query warning:', e.message);
    }

    // 3. Tertiary: Fallback via MAL ID on ARM
    if (malId) {
      try {
        const res = await fetch(`https://arm.haglund.dev/api/v2/ids?source=myanimelist&id=${malId}`, {
          headers: { 'User-Agent': 'Animora/1.0' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.themoviedb || data.imdb)) {
            const mapping = {
              tmdbId: data.themoviedb,
              imdbId: data.imdb,
              type: data.media,
              season: data['themoviedb-season'] || 1,
              offset: data['themoviedb-episode'] || 0
            };
            this.cache.set(id, mapping);
            return mapping;
          }
        }
      } catch (e) {
        console.warn('[RealtimeCrosswalk] MAL ARM fallback warning:', e.message);
      }
    }

    return null;
  }

  buildStream(anilistId, episodeNumber = 1, format = 'TV', mapping = null) {
    const id = Number(anilistId);
    const isMovie = format === 'MOVIE' || mapping?.type === 'MOVIE';

    const tmdbId = mapping?.tmdbId || null;
    const imdbId = mapping?.imdbId || null;
    const season = mapping?.season || 1;
    const offset = mapping?.offset || 0;

    const externalId = String(tmdbId || imdbId || id);
    const resolvedEpisode = Math.max(1, (Number(episodeNumber) || 1) + offset);

    if (isMovie) {
      return {
        provider: 'mirrorbox',
        mediaType: 'movie',
        externalId,
        resolvedSeason: null,
        resolvedEpisode: null,
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

  async resolve(anilistId, episodeNumber = 1, format = 'TV', malId = null) {
    const mapping = await this.getMapping(anilistId, malId);
    return this.buildStream(anilistId, episodeNumber, format, mapping);
  }
}

export const fribbService = new RealtimeCrosswalkService();
