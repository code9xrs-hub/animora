import React, { useEffect, useState } from 'react';
import { Film, Download, Star } from 'lucide-react';
import { fetchBrowse } from '../api/animeApi';
import { AnimeMedia } from '../types/anime';
import { AnimePosterCard } from '../components/cards/AnimePosterCard';
import { SEO } from '../components/common/SEO';

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
      <div className="bg-gradient-to-r from-[#23252B] via-[#141519] to-black border border-[#4A4E58]/40 rounded-2xl p-4 sm:p-8 md:p-10 mb-6 sm:mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#2ABDBB]/20 text-[#2ABDBB] border border-[#2ABDBB]/40 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <Film className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Feature Films
              </span>
              <span className="bg-[#FAB818]/20 text-[#FAB818] border border-[#FAB818]/40 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded">
                1080p / 4K
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
              Anime Movies Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed">
              Explore critically acclaimed theatrical releases, standalone films, and franchise epics. Stream immediately with zero-lag multi-server embeds or download directly to your device.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="text-[11px] sm:text-xs text-[#A0A0A0] font-semibold">Sort:</span>
            <div className="inline-flex rounded-lg bg-[#141519] p-0.5 sm:p-1 border border-[#4A4E58]/50">
              <button
                onClick={() => setSort('POPULARITY_DESC')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded text-[11px] sm:text-xs font-bold transition ${
                  sort === 'POPULARITY_DESC'
                    ? 'bg-[#F47521] text-black shadow'
                    : 'text-[#A0A0A0] hover:text-white'
                }`}
              >
                Popular
              </button>
              <button
                onClick={() => setSort('SCORE_DESC')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded text-[11px] sm:text-xs font-bold transition ${
                  sort === 'SCORE_DESC'
                    ? 'bg-[#F47521] text-black shadow'
                    : 'text-[#A0A0A0] hover:text-white'
                }`}
              >
                Top Rated
              </button>
              <button
                onClick={() => setSort('START_DATE_DESC')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded text-[11px] sm:text-xs font-bold transition ${
                  sort === 'START_DATE_DESC'
                    ? 'bg-[#F47521] text-black shadow'
                    : 'text-[#A0A0A0] hover:text-white'
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
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3 text-white">
          <div className="w-10 h-10 rounded-full border-4 border-[#F47521] border-t-transparent animate-spin" />
          <p className="text-xs text-[#A0A0A0]">Loading Anime Movies...</p>
        </div>
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
