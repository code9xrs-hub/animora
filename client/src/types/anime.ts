export type MediaFormat = 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';
export type MediaStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';

export interface AnimeTitle {
  romaji?: string;
  english?: string;
  native?: string;
}

export interface CoverImage {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
}

export interface Trailer {
  id?: string;
  site?: string;
  thumbnail?: string;
}

export interface NextAiringEpisode {
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
}

export interface AnimeMedia {
  id: number;
  idMal?: number | null;
  title: AnimeTitle;
  format: MediaFormat;
  status: MediaStatus;
  description?: string;
  episodes?: number | null;
  duration?: number | null;
  season?: string;
  seasonYear?: number;
  averageScore?: number;
  popularity?: number;
  source?: string;
  genres: string[];
  bannerImage?: string;
  coverImage: CoverImage;
  trailer?: Trailer;
  nextAiringEpisode?: NextAiringEpisode;
  studios?: {
    nodes: Array<{ id: number; name: string }>;
  };
  streamingEpisodes?: Array<{
    title: string;
    thumbnail: string;
    url: string;
    site: string;
  }>;
  characters?: {
    edges: Array<{
      role: string;
      node: {
        id: number;
        name: { full: string };
        image: { medium: string };
      };
      voiceActors: Array<{
        id: number;
        name: { full: string };
        image: { medium: string };
      }>;
    }>;
  };
  recommendations?: {
    nodes: Array<{
      mediaRecommendation: {
        id: number;
        title: AnimeTitle;
        format: MediaFormat;
        episodes?: number;
        averageScore?: number;
        coverImage: CoverImage;
      };
    }>;
  };
}

export interface MirrorBoxStream {
  provider: 'mirrorbox';
  mediaType: 'movie' | 'tv';
  externalId: string;
  resolvedSeason: number | null;
  resolvedEpisode: number | null;
  embedUrl: string;
  downloadUrl: string;
  availableServers: string[];
  isMapped?: boolean;
}

export interface EpisodeItemDTO {
  episodeNumber: number;
  seasonNumber?: number;
  title: string;
  displayTitle?: string;
  thumbnailUrl: string;
  durationMinutes: number | null;
  isAired: boolean;
  airingAtUnix: number | null;
  mirrorBoxStream: MirrorBoxStream;
}

export interface FranchiseSeasonNode {
  anilistId: number;
  malId?: number | null;
  title: string;
  format: MediaFormat;
  seasonNumberLabel: string;
  episodesCount: number;
  seasonYear?: number | null;
  coverImage?: string;
  isCurrent?: boolean;
}

export interface HomeCatalogResponse {
  season: string;
  year: number;
  spotlight: AnimeMedia[];
  trending: AnimeMedia[];
  simulcast: AnimeMedia[];
  popularMovies: AnimeMedia[];
  topRated: AnimeMedia[];
  actionRail: AnimeMedia[];
  fantasyRail: AnimeMedia[];
}

export interface BrowseResponse {
  pageInfo: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
  };
  media: AnimeMedia[];
}

export interface AiringScheduleItem {
  id: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
  media: AnimeMedia;
}
