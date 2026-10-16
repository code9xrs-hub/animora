import {
  HomeCatalogResponse,
  BrowseResponse,
  EpisodeItemDTO,
  FranchiseSeasonNode,
  AiringScheduleItem
} from '../types/anime';
import { AnimeDetailResponse } from './animeApi';
import { resolveCrosswalkStream } from './crosswalkResolver';

const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';

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

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 1 && month <= 3) return 'WINTER';
  if (month >= 4 && month <= 6) return 'SPRING';
  if (month >= 7 && month <= 9) return 'SUMMER';
  return 'FALL';
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

async function fetchGraphQL(query: string, variables: Record<string, any> = {}): Promise<any> {
  const res = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!res.ok) {
    throw new Error(`AniList returned HTTP ${res.status}`);
  }

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || 'GraphQL Error');
  }
  return json.data;
}

export async function clientFetchHomeCatalog(): Promise<HomeCatalogResponse> {
  const season = getCurrentSeason();
  const year = getCurrentYear();

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
        media(type: ANIME, format: MOVIE, sort: TRENDING_DESC, isAdult: false) {
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

  const data = await fetchGraphQL(query, { season, seasonYear: year });
  return {
    season,
    year,
    spotlight: data?.spotlight?.media || [],
    trending: data?.trending?.media || [],
    simulcast: data?.simulcast?.media || [],
    popularMovies: data?.popularMovies?.media || [],
    topRated: data?.topRated?.media || [],
    actionRail: data?.actionRail?.media || [],
    fantasyRail: data?.fantasyRail?.media || []
  };
}

export async function clientFetchBrowse(params: any = {}): Promise<BrowseResponse> {
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
    page: Number(params.page) || 1,
    perPage: Math.min(50, Number(params.perPage) || 24),
    search: params.search?.trim() ? params.search.trim() : undefined,
    genre: params.genre || undefined,
    format: params.format || undefined,
    season: params.season || undefined,
    seasonYear: params.seasonYear ? Number(params.seasonYear) : undefined,
    status: params.status || undefined,
    sort: params.sort ? [params.sort] : ['POPULARITY_DESC']
  };

  const data = await fetchGraphQL(query, variables);
  return {
    pageInfo: data?.Page?.pageInfo || { total: 0, perPage: 24, currentPage: 1, lastPage: 1, hasNextPage: false },
    media: data?.Page?.media || []
  };
}

export async function clientFetchAnimeDetail(id: string): Promise<AnimeDetailResponse> {
  const numericId = Number(id);

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
        airingSchedule(notYetAired: true, perPage: 25) {
          nodes {
            id
            airingAt
            timeUntilAiring
            episode
          }
        }
        characters(sort: ROLE, perPage: 12) {
          edges {
            role
            node {
              id
              name {
                full
                native
              }
              image {
                medium
                large
              }
            }
          }
        }
        relations {
          edges {
            relationType
            node {
              id
              idMal
              format
              status
              seasonYear
              episodes
              bannerImage
              title {
                romaji
                english
              }
              coverImage {
                extraLarge
                large
              }
            }
          }
        }
        recommendations(sort: RATING_DESC, perPage: 10) {
          nodes {
            mediaRecommendation {
              id
              idMal
              format
              status
              title {
                romaji
                english
              }
              coverImage {
                extraLarge
                large
              }
              averageScore
              episodes
            }
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { id: numericId });
  const media = data?.Media;
  if (!media) throw new Error('Anime not found on AniList');

  const isMovie = media.format === 'MOVIE';

  // Resolve true crosswalk stream (TMDb / IMDb ID with season & offset)
  const defaultStream = await resolveCrosswalkStream(media.id, 1, media.format, media.idMal);

  // Generate episode items & streams
  let episodes: EpisodeItemDTO[] = [];
  if (isMovie) {
    episodes = [{
      episodeNumber: 1,
      title: media.title.english || media.title.romaji || 'Full Movie',
      thumbnailUrl: media.bannerImage || media.coverImage?.extraLarge || '',
      durationMinutes: media.duration || 105,
      isAired: true,
      airingAtUnix: null,
      mirrorBoxStream: defaultStream
    }];
  } else {
    let totalEpisodes = media.episodes;
    if (!totalEpisodes) {
      if (media.nextAiringEpisode) {
        totalEpisodes = media.nextAiringEpisode.episode - 1;
      } else if (media.airingSchedule?.nodes?.length > 0) {
        totalEpisodes = Math.max(...media.airingSchedule.nodes.map((n: any) => n.episode));
      } else if (media.streamingEpisodes?.length > 0) {
        totalEpisodes = media.streamingEpisodes.length;
      } else {
        totalEpisodes = 1;
      }
    }

    const count = Math.max(1, totalEpisodes);
    const airingMap = new Map();
    if (media.airingSchedule?.nodes) {
      for (const n of media.airingSchedule.nodes) {
        if (n && typeof n.episode === 'number') airingMap.set(n.episode, n);
      }
    }

    const rawStreaming = media.streamingEpisodes || [];
    const streamMap = new Map();
    for (const s of rawStreaming) {
      if (!s?.title) continue;
      const match = s.title.match(/Episode\s+(\d+)/i) || s.title.match(/^E(\d+)/i) || s.title.match(/^(\d+)\s*[-.:]/);
      if (match) {
        const epNum = parseInt(match[1], 10);
        let cleanTitle = s.title.replace(/^(?:Episode\s+\d+|E\d+|\d+)\s*[-.:]\s*/i, '').trim() || `Episode ${epNum}`;
        streamMap.set(epNum, { cleanTitle, thumbnail: s.thumbnail });
      }
    }

    const externalId = defaultStream.externalId;
    const season = defaultStream.resolvedSeason || 1;
    const offset = Math.max(0, (defaultStream.resolvedEpisode || 1) - 1);

    for (let i = 1; i <= count; i++) {
      const airing = airingMap.get(i);
      const isAired = !airing;
      const streaming = streamMap.get(i);
      const targetEp = i + offset;

      episodes.push({
        episodeNumber: i,
        seasonNumber: season,
        displayTitle: `Episode ${i}`,
        title: streaming?.cleanTitle || `Episode ${i}`,
        thumbnailUrl: streaming?.thumbnail || media.bannerImage || media.coverImage?.extraLarge || '',
        durationMinutes: media.duration || 24,
        isAired,
        airingAtUnix: airing?.airingAt || null,
        mirrorBoxStream: {
          provider: 'mirrorbox',
          mediaType: 'tv',
          externalId,
          resolvedSeason: season,
          resolvedEpisode: targetEp,
          embedUrl: `https://mirrorboxapi.web.app/tv/${externalId}/${season}/${targetEp}`,
          downloadUrl: `https://mirrorboxapi.web.app/download/tv/${externalId}/${season}/${targetEp}`,
          availableServers: defaultStream.availableServers,
          isMapped: defaultStream.isMapped
        }
      });
    }
  }

  // Relations / Franchise seasons
  const franchiseSeasons: FranchiseSeasonNode[] = [{
    anilistId: media.id,
    malId: media.idMal,
    seasonNumberLabel: 'Season 1',
    title: media.title.english || media.title.romaji || 'Season 1',
    format: media.format,
    episodesCount: media.episodes || episodes.length,
    seasonYear: media.seasonYear,
    coverImage: media.coverImage?.large,
    isCurrent: true
  }];

  if (media.relations?.edges) {
    let sIdx = 2;
    for (const rel of media.relations.edges) {
      if (rel.relationType === 'SEQUEL' || rel.relationType === 'PREQUEL') {
        const node = rel.node;
        if (node && (node.format === 'TV' || node.format === 'TV_SHORT' || node.format === 'ONA')) {
          franchiseSeasons.push({
            anilistId: node.id,
            malId: node.idMal,
            seasonNumberLabel: `Season ${sIdx++}`,
            title: node.title?.english || node.title?.romaji || `Season ${sIdx}`,
            format: node.format,
            episodesCount: node.episodes || 12,
            seasonYear: node.seasonYear,
            coverImage: node.coverImage?.large,
            isCurrent: false
          });
        }
      }
    }
  }

  return {
    media,
    episodes,
    franchiseSeasons
  };
}

export async function clientFetchCalendar(year: number, month: number): Promise<AiringScheduleItem[]> {
  const startOfMonth = Math.floor(new Date(year, month - 1, 1).getTime() / 1000);
  const endOfMonth = Math.floor(new Date(year, month, 0, 23, 59, 59).getTime() / 1000);

  const query = `
    ${MEDIA_CARD_FRAGMENT}
    query AiringCalendarBatch($start: Int, $end: Int) {
      Page(page: 1, perPage: 50) {
        airingSchedules(airingAt_greater: $start, airingAt_lesser: $end) {
          id
          airingAt
          timeUntilAiring
          episode
          media {
            ...MediaCardFields
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { start: startOfMonth, end: endOfMonth });
  return data?.Page?.airingSchedules || [];
}
