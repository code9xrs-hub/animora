/** Shared catalog filter options used by the navigation menu and the browse page. */

export const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Psychological', 'Romance',
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

export const FORMATS = [
  { label: 'All Formats', value: '' },
  { label: 'TV Series', value: 'TV' },
  { label: 'Movie', value: 'MOVIE' },
  { label: 'TV Short', value: 'TV_SHORT' },
  { label: 'OVA', value: 'OVA' },
  { label: 'ONA', value: 'ONA' },
  { label: 'Special', value: 'SPECIAL' }
];

export const SEASONS = [
  { label: 'All Seasons', value: '' },
  { label: 'Winter', value: 'WINTER' },
  { label: 'Spring', value: 'SPRING' },
  { label: 'Summer', value: 'SUMMER' },
  { label: 'Fall', value: 'FALL' }
];

export const STATUSES = [
  { label: 'Any Status', value: '' },
  { label: 'Airing', value: 'RELEASING' },
  { label: 'Finished', value: 'FINISHED' },
  { label: 'Upcoming', value: 'NOT_YET_RELEASED' }
];

export const SORTS = [
  { label: 'Most Popular', value: 'POPULARITY_DESC' },
  { label: 'Trending Now', value: 'TRENDING_DESC' },
  { label: 'Highest Rated', value: 'SCORE_DESC' },
  { label: 'Recently Released', value: 'START_DATE_DESC' },
  { label: 'Alphabetical', value: 'TITLE_ROMAJI' }
];

/** Every year from next year back to 1980, newest first. */
export const YEARS = Array.from({ length: new Date().getFullYear() + 2 - 1980 }, (_, i) => new Date().getFullYear() + 1 - i);

