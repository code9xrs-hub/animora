import React, { useEffect, useState } from 'react';
import { fetchBrowse } from '../api/animeApi';
import { AnimeMedia } from '../types/anime';
import { HeroBannerCarousel } from '../components/home/HeroBannerCarousel';
import { MediaSwimlane } from '../components/home/MediaSwimlane';
import { SEO } from '../components/common/SEO';
import { HomePageSkeleton } from '../components/common/Shimmer';

export const MoviesPage: React.FC = () => {
  const [popularMovies, setPopularMovies] = useState<AnimeMedia[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<AnimeMedia[]>([]);
  const [newestMovies, setNewestMovies] = useState<AnimeMedia[]>([]);
  const [spotlightMovies, setSpotlightMovies] = useState<AnimeMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAllMovies() {
      try {
        setLoading(true);
        const [popularRes, topRatedRes, newestRes] = await Promise.all([
          fetchBrowse({ format: 'MOVIE', sort: 'POPULARITY_DESC', perPage: 24 }),
          fetchBrowse({ format: 'MOVIE', sort: 'SCORE_DESC', perPage: 24 }),
          fetchBrowse({ format: 'MOVIE', sort: 'START_DATE_DESC', perPage: 24 })
        ]);

        const pop = popularRes.media || [];
        const top = topRatedRes.media || [];
        const recent = newestRes.media || [];

        setPopularMovies(pop);
        setTopRatedMovies(top);
        setNewestMovies(recent);

        // Top 8 movies for the hero banner carousel
        setSpotlightMovies(pop.slice(0, 8));
      } catch (err: any) {
        console.error('Failed to load anime movies:', err);
        setError(err.message || 'Error loading movies');
      } finally {
        setLoading(false);
      }
    }
    loadAllMovies();
  }, []);

  if (loading) {
    return <HomePageSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-white px-4">
        <p className="text-red-400 font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#F47521] text-black font-bold px-5 py-2 rounded-xl text-xs hover:bg-[#FF8533] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      <SEO
        title="Anime Movies — Watch Popular Feature Films in HD"
        description="Stream critically acclaimed theatrical releases, standalone anime films, and franchise epics in HD with zero-wait direct downloads on Animora."
        type="video.movie"
      />

      {/* 1. Feature Film Hero Carousel Slider */}
      {spotlightMovies.length > 0 && (
        <HeroBannerCarousel items={spotlightMovies} />
      )}

      {/* 2. Left-to-Right Scrolling Horizontal Swimlanes */}
      <div className="w-full py-2 sm:py-4 space-y-2 sm:space-y-4">
        {popularMovies.length > 0 && (
          <MediaSwimlane
            title="Popular Movies"
            subtitle="Most watched theatrical anime"
            items={popularMovies}
            viewAllLink="/browse?format=MOVIE&sort=POPULARITY_DESC"
            badge="POPULAR"
          />
        )}

        {topRatedMovies.length > 0 && (
          <MediaSwimlane
            title="Top Rated Movies"
            subtitle="Critically acclaimed feature masterworks"
            items={topRatedMovies}
            viewAllLink="/browse?format=MOVIE&sort=SCORE_DESC"
            badge="TOP RATED"
          />
        )}

        {newestMovies.length > 0 && (
          <MediaSwimlane
            title="Newest Movies"
            subtitle="Latest additions and theatrical releases"
            items={newestMovies}
            viewAllLink="/browse?format=MOVIE&sort=START_DATE_DESC"
            badge="NEWEST"
          />
        )}
      </div>
    </div>
  );
};
