const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';

class Cache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds) {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000
    });
  }
}

const cache = new Cache();

// In-memory rate limiter / queue
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 650; // ~90 req/min safety buffer

async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((res) => setTimeout(res, MIN_REQUEST_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

async function fetchGraphQL(query, variables = {}) {
  await throttle();

  const res = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[AniList] GraphQL Error ${res.status}:`, errorText);
    throw new Error(`AniList API returned ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || 'GraphQL Query Error');
  }

  return json.data;
}

const MEDIA_CARD_FRAGMENT = `
fragment MediaCardFields on Media {
  id
  idMal
  title {
    romaji
    english
    native
  }
  format
  status
  description(asHtml: false)
  episodes
  duration
  season
  seasonYear
  averageScore
  popularity
  genres
  bannerImage
  coverImage {
    extraLarge
    large
    color
  }
  nextAiringEpisode {
    airingAt
    timeUntilAiring
    episode
  }
  trailer {
    id
    site
    thumbnail
  }
}
`;

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 1 && month <= 3) return 'WINTER';
  if (month >= 4 && month <= 6) return 'SPRING';
  if (month >= 7 && month <= 9) return 'SUMMER';
  return 'FALL';
}

function getCurrentYear() {
  return new Date().getFullYear();
}

export class AniListService {
  async getHomeCatalog() {
    const currentSeason = getCurrentSeason();
    const currentYear = getCurrentYear();
    const cacheKey = `home_catalog_${currentSeason}_${currentYear}`;

    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const query = `
      ${MEDIA_CARD_FRAGMENT}
      query HomeCatalogBatch($season: MediaSeason, $seasonYear: Int) {
        spotlight: Page(page: 1, perPage: 8) {
          media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
            ...MediaCardFields
          }
        }
        trending: Page(page: 1, perPage: 18) {
          media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
            ...MediaCardFields
          }
        }
        simulcast: Page(page: 1, perPage: 18) {
          media(type: ANIME, season: $season, seasonYear: $seasonYear, status: RELEASING, sort: POPULARITY_DESC, isAdult: false) {
            ...MediaCardFields
          }
        }
        popularMovies: Page(page: 1, perPage: 18) {
          media(type: ANIME, format: MOVIE, sort: POPULARITY_DESC, isAdult: false) {
            ...MediaCardFields
          }
        }
        topRated: Page(page: 1, perPage: 18) {
          media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
            ...MediaCardFields
          }
        }
        actionRail: Page(page: 1, perPage: 18) {
          media(type: ANIME, genre: "Action", sort: POPULARITY_DESC, isAdult: false) {
            ...MediaCardFields
          }
        }
        fantasyRail: Page(page: 1, perPage: 18) {
          media(type: ANIME, genre: "Fantasy", sort: POPULARITY_DESC, isAdult: false) {
            ...MediaCardFields
          }
        }
      }
    `;

    const data = await fetchGraphQL(query, { season: currentSeason, seasonYear: currentYear });
    const result = {
      season: currentSeason,
      year: currentYear,
      spotlight: data?.spotlight?.media || [],
      trending: data?.trending?.media || [],
      simulcast: data?.simulcast?.media || [],
      popularMovies: data?.popularMovies?.media || [],
      topRated: data?.topRated?.media || [],
      actionRail: data?.actionRail?.media || [],
      fantasyRail: data?.fantasyRail?.media || []
    };

    cache.set(cacheKey, result, 900); // 15 mins TTL
    return result;
  }

  async browse({
    page = 1,
    perPage = 24,
    search = null,
    genre = null,
    format = null,
    season = null,
    seasonYear = null,
    status = null,
    sort = 'POPULARITY_DESC'
  }) {
    const cacheKey = `browse_${page}_${perPage}_${search}_${genre}_${format}_${season}_${seasonYear}_${status}_${sort}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const query = `
      ${MEDIA_CARD_FRAGMENT}
      query BrowseMedia(
        $page: Int,
        $perPage: Int,
        $search: String,
        $genre: String,
        $format: MediaFormat,
        $season: MediaSeason,
        $seasonYear: Int,
        $status: MediaStatus,
        $sort: [MediaSort]
      ) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(
            type: ANIME,
            search: $search,
            genre: $genre,
            format: $format,
            season: $season,
            seasonYear: $seasonYear,
            status: $status,
            sort: $sort,
            isAdult: false
          ) {
            ...MediaCardFields
          }
        }
      }
    `;

    const variables = {
      page: Number(page) || 1,
      perPage: Math.min(50, Number(perPage) || 24),
      search: search?.trim() ? search.trim() : undefined,
      genre: genre || undefined,
      format: format || undefined,
      season: season || undefined,
      seasonYear: seasonYear ? Number(seasonYear) : undefined,
      status: status || undefined,
      sort: sort ? [sort] : ['POPULARITY_DESC']
    };

    const data = await fetchGraphQL(query, variables);
    const result = {
      pageInfo: data?.Page?.pageInfo || {},
      media: data?.Page?.media || []
    };

    cache.set(cacheKey, result, 600); // 10 mins TTL
    return result;
  }

  async getMediaDetail(id) {
    const numericId = Number(id);
    const cacheKey = `media_detail_${numericId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const query = `
      query MediaDetailWithRelations($id: Int!) {
        Media(id: $id, type: ANIME) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          format
          status
          description(asHtml: false)
          startDate { year month day }
          endDate { year month day }
          season
          seasonYear
          episodes
          duration
          countryOfOrigin
          source
          genres
          averageScore
          popularity
          bannerImage
          coverImage {
            extraLarge
            large
            color
          }
          trailer {
            id
            site
            thumbnail
          }
          nextAiringEpisode {
            airingAt
            timeUntilAiring
            episode
          }
          airingSchedule(perPage: 150) {
            nodes {
              id
              episode
              airingAt
              timeUntilAiring
            }
          }
          studios(isMain: true) {
            nodes {
              id
              name
            }
          }
          streamingEpisodes {
            title
            thumbnail
            url
            site
          }
          relations {
            edges {
              relationType(version: 2)
              node {
                id
                idMal
                type
                format
                status
                episodes
                season
                seasonYear
                startDate { year month day }
                title {
                  romaji
                  english
                }
                coverImage {
                  large
                }
              }
            }
          }
          characters(sort: [ROLE, RELEVANCE], page: 1, perPage: 12) {
            edges {
              role
              node {
                id
                name { full }
                image { medium }
              }
              voiceActors(language: JAPANESE, sort: [RELEVANCE]) {
                id
                name { full }
                image { medium }
              }
            }
          }
          recommendations(sort: [RATING_DESC], page: 1, perPage: 12) {
            nodes {
              mediaRecommendation {
                id
                title { romaji english }
                format
                episodes
                averageScore
                coverImage { extraLarge large }
              }
            }
          }
        }
      }
    `;

    const data = await fetchGraphQL(query, { id: numericId });
    const media = data?.Media;
    if (!media) return null;

    cache.set(cacheKey, media, 3600); // 1 hour TTL
    return media;
  }

  async getCalendarSchedule(startUnix, endUnix) {
    const cacheKey = `calendar_${startUnix}_${endUnix}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const query = `
      query AiringSchedule($start: Int, $end: Int) {
        Page(page: 1, perPage: 50) {
          airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
            id
            airingAt
            timeUntilAiring
            episode
            media {
              id
              idMal
              title {
                romaji
                english
                native
              }
              format
              status
              episodes
              coverImage {
                large
                extraLarge
              }
              bannerImage
              genres
              averageScore
            }
          }
        }
      }
    `;

    const data = await fetchGraphQL(query, {
      start: Number(startUnix),
      end: Number(endUnix)
    });

    const schedules = data?.Page?.airingSchedules || [];
    cache.set(cacheKey, schedules, 600); // 10 mins TTL
    return schedules;
  }

  async fetchFranchiseNodes(ids) {
    if (!ids || ids.length === 0) return [];
    const cacheKey = `franchise_nodes_${ids.sort().join('_')}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const query = `
      query HopFranchise($ids: [Int]) {
        Page(page: 1, perPage: 25) {
          media(id_in: $ids, type: ANIME) {
            id
            idMal
            type
            format
            status
            episodes
            season
            seasonYear
            startDate { year month day }
            title {
              romaji
              english
            }
            coverImage {
              large
            }
            relations {
              edges {
                relationType(version: 2)
                node {
                  id
                  idMal
                  type
                  format
                  status
                  episodes
                  season
                  seasonYear
                  startDate { year month day }
                  title {
                    romaji
                    english
                  }
                  coverImage {
                    large
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const data = await fetchGraphQL(query, { ids });
      const nodes = data?.Page?.media || [];
      cache.set(cacheKey, nodes, 3600);
      return nodes;
    } catch (e) {
      console.warn('fetchFranchiseNodes error:', e.message);
      return [];
    }
  }
}

export const anilistService = new AniListService();
