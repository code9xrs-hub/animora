import React, { useEffect, useState } from 'react';
import { Film, Download, Star } from 'lucide-react';
import { fetchBrowse } from '../api/animeApi';
import { AnimeMedia } from '../types/anime';
import { AnimePosterCard } from '../components/cards/AnimePosterCard';
import { SEO } from '../components/common/SEO';
import { GridSkeleton } from '../components/common/Shimmer';

export const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<AnimeMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<'POPULARITY_DESC' | 'SCORE_DESC' | 'START_DATE_DESC'>('POPULARITY_DESC');

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        const res = await fetchBrowse({
          format: 'MOVIE',
          sort,
          perPage: 36
        });
        setMovies(res.media || []);
      } catch (err: any) {
        console.error('Failed to load anime movies:', err);
        setError(err.message || 'Error loading movies');
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, [sort]);

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full pb-20">
      <SEO
        title="Anime Movies — Watch Popular Feature Films in HD"
        description="Stream critically acclaimed theatrical releases, standalone anime films, and franchise epics in HD with zero-wait direct downloads on Animora."
        type="video.movie"
      />
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#181A22] via-[#14151B] to-[#0E0F13] border border-white/[0.08] rounded-2xl p-5 sm:p-8 md:p-10 mb-6 sm:mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#2ABDBB]/15 text-[#2ABDBB] border border-[#2ABDBB]/30 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Feature Films
              </span>
              <span className="bg-[#FAB818]/15 text-[#FAB818] border border-[#FAB818]/30 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md">
                1080p / 4K
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              Anime Movies Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#8E93A0] leading-relaxed">
              Explore critically acclaimed theatrical releases, standalone films, and franchise epics. Stream immediately with zero-lag multi-server embeds or download directly to your device.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="text-xs text-[#8E93A0] font-medium">Sort:</span>
            <div className="inline-flex rounded-xl bg-[#121316] p-1 border border-white/10">
              <button
                onClick={() => setSort('POPULARITY_DESC')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sort === 'POPULARITY_DESC'
                    ? 'bg-[#F47521] text-black shadow-sm font-bold'
                    : 'text-[#8E93A0] hover:text-white'
                }`}
              >
                Popular
              </button>
              <button
                onClick={() => setSort('SCORE_DESC')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sort === 'SCORE_DESC'
                    ? 'bg-[#F47521] text-black shadow-sm font-bold'
                    : 'text-[#8E93A0] hover:text-white'
                }`}
              >
                Top Rated
              </button>
              <button
                onClick={() => setSort('START_DATE_DESC')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sort === 'START_DATE_DESC'
                    ? 'bg-[#F47521] text-black shadow-sm font-bold'
                    : 'text-[#8E93A0] hover:text-white'
                }`}
              >
                Newest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Cards Grid */}
      {loading ? (
        <GridSkeleton count={24} />
      ) : error ? (
        <div className="w-full py-16 text-center text-red-400">{error}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <AnimePosterCard key={movie.id} anime={movie} />
          ))}
        </div>
      )}
    </div>
  );
};
