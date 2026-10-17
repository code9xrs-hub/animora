import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchBrowse, BrowseParams } from '../api/animeApi';
import { AnimeMedia, BrowseResponse } from '../types/anime';
import { AnimePosterCard } from '../components/cards/AnimePosterCard';
import { SEO } from '../components/common/SEO';
import { GridSkeleton } from '../components/common/Shimmer';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Psychological', 'Romance',
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

const FORMATS = [
  { label: 'All Formats', value: '' },
  { label: 'TV Series', value: 'TV' },
  { label: 'Movie', value: 'MOVIE' },
  { label: 'TV Short', value: 'TV_SHORT' },
  { label: 'OVA', value: 'OVA' },
  { label: 'ONA', value: 'ONA' },
  { label: 'Special', value: 'SPECIAL' }
];

const SEASONS = [
  { label: 'All Seasons', value: '' },
  { label: 'Winter', value: 'WINTER' },
  { label: 'Spring', value: 'SPRING' },
  { label: 'Summer', value: 'SUMMER' },
  { label: 'Fall', value: 'FALL' }
];

const SORTS = [
  { label: 'Most Popular', value: 'POPULARITY_DESC' },
  { label: 'Trending Now', value: 'TRENDING_DESC' },
  { label: 'Highest Rated', value: 'SCORE_DESC' },
  { label: 'Recently Released', value: 'START_DATE_DESC' },
  { label: 'Alphabetical', value: 'TITLE_ROMAJI' }
];

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<BrowseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read current filters from URL
  const search = searchParams.get('search') || '';
  const genre = searchParams.get('genre') || '';
  const format = searchParams.get('format') || '';
  const season = searchParams.get('season') || '';
  const seasonYear = searchParams.get('seasonYear') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || 'POPULARITY_DESC';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    async function loadBrowse() {
      try {
        setLoading(true);
        const res = await fetchBrowse({
          page,
          perPage: 24,
          search: search || undefined,
          genre: genre || undefined,
          format: format || undefined,
          season: season || undefined,
          seasonYear: seasonYear ? Number(seasonYear) : undefined,
          status: status || undefined,
          sort
        });
        setData(res);
      } catch (err: any) {
        console.error('Failed to browse:', err);
        setError(err.message || 'Error browsing catalog');
      } finally {
        setLoading(false);
      }
    }
    loadBrowse();
  }, [search, genre, format, season, seasonYear, status, sort, page]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const seoTitle = search
    ? `Search results for "${search}"`
    : genre
    ? `${genre} Anime Series & Movies`
    : 'Browse All Anime Series & Movies';

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full pb-20">
      <SEO
        title={seoTitle}
        description="Search, filter, and discover thousands of popular anime series, simulcasts, and movies in HD on Animora."
      />
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-display font-black text-xl sm:text-3xl text-white">
            Explore Anime Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#A0A0A0] mt-0.5 sm:mt-1">
            Browse tens of thousands of anime series, OVAs, and films powered by AniList & Mirror-Box.
          </p>
        </div>

        {/* Live Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search anime title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#181A22] border border-white/10 focus:border-[#F47521] focus:ring-1 focus:ring-[#F47521] text-white pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm placeholder:text-[#636875] focus:outline-none transition-all shadow-sm"
          />
          <Search className="w-4 h-4 text-[#8E93A0] absolute left-3 top-3 pointer-events-none" />
        </form>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-[#181A22] border border-white/[0.08] rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3 mb-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/90">
            <Filter className="w-4 h-4 text-[#F47521]" />
            <span>Filter Catalog</span>
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 text-xs text-[#8E93A0] hover:text-[#F47521] transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {/* Genre */}
          <div>
            <label className="block text-[11px] font-medium text-[#8E93A0] uppercase tracking-wider mb-1.5">Genre</label>
            <select
              value={genre}
              onChange={(e) => updateParam('genre', e.target.value)}
              className="w-full bg-[#121318] text-xs text-white/90 border border-white/10 rounded-xl px-3 py-2.5 focus:border-[#F47521] focus:ring-1 focus:ring-[#F47521] focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All Genres</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-[11px] font-medium text-[#8E93A0] uppercase tracking-wider mb-1.5">Format</label>
            <select
              value={format}
              onChange={(e) => updateParam('format', e.target.value)}
              className="w-full bg-[#121318] text-xs text-white/90 border border-white/10 rounded-xl px-3 py-2.5 focus:border-[#F47521] focus:ring-1 focus:ring-[#F47521] focus:outline-none transition-all cursor-pointer"
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Season */}
          <div>
            <label className="block text-[11px] font-medium text-[#8E93A0] uppercase tracking-wider mb-1.5">Season</label>
            <select
              value={season}
              onChange={(e) => updateParam('season', e.target.value)}
              className="w-full bg-[#121318] text-xs text-white/90 border border-white/10 rounded-xl px-3 py-2.5 focus:border-[#F47521] focus:ring-1 focus:ring-[#F47521] focus:outline-none transition-all cursor-pointer"
            >
              {SEASONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-[11px] font-medium text-[#8E93A0] uppercase tracking-wider mb-1.5">Sort By</label>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full bg-[#121318] text-xs text-white/90 border border-white/10 rounded-xl px-3 py-2.5 focus:border-[#F47521] focus:ring-1 focus:ring-[#F47521] focus:outline-none transition-all cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[11px] font-medium text-[#8E93A0] uppercase tracking-wider mb-1.5">Year</label>
            <select
              value={seasonYear}
              onChange={(e) => updateParam('seasonYear', e.target.value)}
              className="w-full bg-[#121318] text-xs text-white/90 border border-white/10 rounded-xl px-3 py-2.5 focus:border-[#F47521] focus:ring-1 focus:ring-[#F47521] focus:outline-none transition-all cursor-pointer"
            >
              <option value="">Any Year</option>
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2015, 2010, 2005, 2000].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <GridSkeleton count={24} />
      ) : error || !data ? (
        <div className="w-full py-16 text-center text-red-400 font-medium">
          {error || 'Error loading results'}
        </div>
      ) : data.media.length === 0 ? (
        <div className="w-full py-20 text-center bg-[#181A22] rounded-2xl border border-white/[0.08] space-y-3 p-6">
          <p className="text-base text-white font-semibold">No anime matched your active filters</p>
          <p className="text-xs text-[#8E93A0] max-w-sm mx-auto">Try adjusting your search query, genre, or format settings.</p>
          <button
            onClick={handleResetFilters}
            className="bg-[#F47521] hover:bg-[#FF8533] text-black font-bold px-4 py-2 rounded-xl text-xs transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Anime Grid (2 cols mobile, 3 tablet, 5-6 desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
            {data.media.map((anime) => (
              <AnimePosterCard key={anime.id} anime={anime} />
            ))}
          </div>

          {/* Pagination Bar */}
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#181A22] hover:bg-[#F47521] hover:text-black text-white/90 text-xs font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-medium text-[#8E93A0] px-3">
              Page {page} {data.pageInfo.lastPage ? `of ${data.pageInfo.lastPage}` : ''}
            </span>

            <button
              disabled={!data.pageInfo.hasNextPage}
              onClick={() => handlePageChange(page + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#181A22] hover:bg-[#F47521] hover:text-black text-white/90 text-xs font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
