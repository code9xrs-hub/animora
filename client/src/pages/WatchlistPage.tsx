import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Bookmark, History, Trash2, Play, Sparkles } from 'lucide-react';
import {
  getWatchlist,
  getWatchHistory,
  clearWatchHistory,
  removeHistoryItem
} from '../api/animeApi';
import { useWatchlist, useWatchHistory } from '../lib/userStore';
import { AnimePosterCard } from '../components/cards/AnimePosterCard';
import { getWatchUrl } from '../lib/slug';
import { getHighResPoster } from '../lib/imageUtils';
import { SEO } from '../components/common/SEO';
import { GridSkeleton } from '../components/common/Shimmer';

export const WatchlistPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') === 'history' ? 'history' : 'watchlist';

  // Local store is reactive: adding/removing anywhere in the app updates this page instantly.
  const watchlist = useWatchlist();
  const history = useWatchHistory();
  const [hydrating, setHydrating] = useState(() => watchlist.length === 0 || history.length === 0);

  // One-time hydration from the backend for devices with no local data yet.
  useEffect(() => {
    let active = true;
    Promise.allSettled([getWatchlist(), getWatchHistory()]).finally(() => {
      if (active) setHydrating(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const loading = hydrating && watchlist.length === 0 && history.length === 0;

  const handleClearHistory = () => {
    if (window.confirm('Clear your entire watch history? This cannot be undone.')) {
      clearWatchHistory();
    }
  };
  const setTab = (tab: 'watchlist' | 'history') => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'history') {
      next.set('tab', 'history');
    } else {
      next.delete('tab');
    }
    setSearchParams(next);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full pb-20">
      <SEO
        title={currentTab === 'history' ? 'My Watch History — Animora' : 'My Anime Watchlist — Animora'}
        description="Manage your saved anime queue and resume watching where you left off on Animora."
        canonical="/watchlist"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-display font-black text-xl sm:text-3xl text-white">
            My Watchlist & Activity
          </h1>
          <p className="text-xs sm:text-sm text-[#A0A0A0] mt-0.5 sm:mt-1">
            Access your bookmarked anime titles, queue, and playback history across all devices.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex rounded-xl bg-[#181A20] p-1 border border-white/10 shadow-sm">
          <button
            onClick={() => setTab('watchlist')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'watchlist'
                ? 'bg-[#F47521] text-black shadow-sm font-bold'
                : 'text-[#8E93A0] hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Watchlist ({watchlist.length})</span>
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'history'
                ? 'bg-[#F47521] text-black shadow-sm font-bold'
                : 'text-[#8E93A0] hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={12} />
      ) : currentTab === 'watchlist' ? (
        /* Watchlist View */
        watchlist.length === 0 ? (
          <div className="w-full py-20 text-center bg-[#181A22] rounded-2xl border border-white/[0.08] space-y-4 p-6">
            <Bookmark className="w-12 h-12 text-[#8E93A0] mx-auto stroke-1" />
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">Your Watchlist is empty</p>
              <p className="text-xs text-[#8E93A0] max-w-sm mx-auto">
                Explore popular anime and click "Add to Watchlist" or the bookmark icon to save titles here.
              </p>
            </div>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 bg-[#F47521] hover:bg-[#FF8533] text-black font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
            {watchlist.map((anime) => (
              <AnimePosterCard key={anime.id} anime={anime} />

            ))}
          </div>
        )
      ) : (
        /* History View */
        history.length === 0 ? (
          <div className="w-full py-20 text-center bg-[#181A22] rounded-2xl border border-white/[0.08] space-y-4 p-6">
            <History className="w-12 h-12 text-[#8E93A0] mx-auto stroke-1" />
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">No watch history yet</p>
              <p className="text-xs text-[#8E93A0] max-w-sm mx-auto">
                When you watch episodes, they'll appear here so you can pick right back up where you left off.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#F47521] hover:bg-[#FF8533] text-black font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Watching</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.map((item) => {
                const anime = item.media;
                const title = anime?.title?.english || anime?.title?.romaji || `Anime #${item.anilistId}`;
                const resumeUrl = item.media ? getWatchUrl(item.media, item.seasonNumber || 1, item.episodeNumber) : `/watch/${item.anilistId}/ep/${item.episodeNumber}`;
                const thumbnail = anime?.bannerImage || getHighResPoster(anime);

                return (
                  <div
                    key={item.anilistId}
                    className="flex flex-col rounded-xl overflow-hidden bg-[#181A20] border border-white/[0.08] group hover:border-white/20 transition-all shadow-sm"
                  >
                    <Link to={resumeUrl} state={{ anilistId: item.anilistId }} className="relative aspect-video w-full bg-black block overflow-hidden">
                      <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-[#F47521] flex items-center justify-center text-black shadow-md">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                        <span className="bg-black/75 backdrop-blur-md text-[10px] font-semibold px-2 py-0.5 rounded-md text-white border border-white/10">
                          {item.media?.format === 'MOVIE' ? 'Watch Movie' : `Resume Ep ${item.episodeNumber}`}
                        </span>
                      </div>
                    </Link>

                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={resumeUrl}
                            state={{ anilistId: item.anilistId }}
                            className="text-xs sm:text-sm font-semibold text-white/90 hover:text-[#F47521] transition line-clamp-1 flex-1"
                          >
                            {title}
                          </Link>
                          <button
                            onClick={() => removeHistoryItem(item.anilistId)}
                            aria-label={`Remove ${title} from history`}
                            className="text-[#8E93A0] hover:text-red-400 p-1 rounded-md transition sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                            title="Remove from history"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-[#8E93A0]">
                          Episode {item.episodeNumber} • {new Date(item.watchedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        to={resumeUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F47521] hover:text-[#FF8533] pt-1.5 border-t border-white/[0.06]"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Playback</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
};
