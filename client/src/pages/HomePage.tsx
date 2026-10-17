import React, { useEffect, useState } from 'react';
import { fetchHomeCatalog, getWatchHistory, WatchHistoryItem } from '../api/animeApi';
import { HomeCatalogResponse } from '../types/anime';
import { HeroBannerCarousel } from '../components/home/HeroBannerCarousel';
import { MediaSwimlane } from '../components/home/MediaSwimlane';
import { AnimePosterCard } from '../components/cards/AnimePosterCard';
import { SEO } from '../components/common/SEO';
import { HomePageSkeleton } from '../components/common/Shimmer';

export const HomePage: React.FC = () => {
  const [data, setData] = useState<HomeCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catalogRes, historyRes] = await Promise.all([
          fetchHomeCatalog(),
          getWatchHistory()
        ]);
        setData(catalogRes);
        setHistory(historyRes);
      } catch (err: any) {
        console.error('Failed to load home page:', err);
        setError(err.message || 'Error loading catalog');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <HomePageSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-white px-4">
        <p className="text-red-400 font-semibold">{error || 'Failed to load catalog'}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#F47521] text-black font-bold px-5 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Filter history to items that have media attached
  const continueWatchingMedia = history
    .filter((h) => h.media)
    .map((h) => h.media!);

  return (
    <div className="w-full pb-2 md:pb-8">
      <SEO
        title="Watch Trending Anime & Simulcasts Online Free"
        description="Stream thousands of trending anime series, simulcasts, and movies in HD with zero-wait direct downloads and multi-server playback on Animora."
      />
      {/* 1. Hero Spotlight Carousel */}
      {data.spotlight && data.spotlight.length > 0 && (
        <HeroBannerCarousel items={data.spotlight} />
      )}

      {/* 2. Continue Watching (if user has history) */}
      {continueWatchingMedia.length > 0 && (
        <MediaSwimlane
          title="Continue Watching"
          subtitle="Pick up where you left off"
          items={continueWatchingMedia}
          viewAllLink="/watchlist?tab=history"
        />
      )}

      {/* 3. Trending Now */}
      <MediaSwimlane
        title="Trending Now"
        subtitle="Most watched in the community right now"
        items={data.trending}
        viewAllLink="/browse?sort=TRENDING_DESC"
        badge="Top 10"
      />

      {/* 4. Simulcast Season — Airing Now */}
      <MediaSwimlane
        title={`Simulcast Season — ${data.season} ${data.year}`}
        subtitle="Fresh episodes straight from Japan with English subtitles"
        items={data.simulcast}
        viewAllLink={`/browse?season=${data.season}&seasonYear=${data.year}&status=RELEASING`}
      />

      {/* 5. Top Rated Anime Movies */}
      <MediaSwimlane
        title="Top Rated Anime Movies"
        subtitle="Feature films with direct high-speed downloads"
        items={data.popularMovies}
        viewAllLink="/movies"
      />

      {/* 6. Most Popular All-Time */}
      <MediaSwimlane
        title="Most Popular All-Time"
        subtitle="The definitive highest rated anime series"
        items={data.topRated}
        viewAllLink="/browse?sort=SCORE_DESC"
      />

      {/* 7. Curated Action Rail */}
      {data.actionRail && data.actionRail.length > 0 && (
        <MediaSwimlane
          title="Action & Epic Battles"
          subtitle="High adrenaline showdowns and supernatural powers"
          items={data.actionRail}
          viewAllLink="/browse?genre=Action"
        />
      )}

      {/* 8. Curated Fantasy Rail */}
      {data.fantasyRail && data.fantasyRail.length > 0 && (
        <MediaSwimlane
          title="Fantasy & Other Worlds"
          subtitle="Isekai, magic realms, and mystical quests"
          items={data.fantasyRail}
          viewAllLink="/browse?genre=Fantasy"
        />
      )}
    </div>
  );
};
