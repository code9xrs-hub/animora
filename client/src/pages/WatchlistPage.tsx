import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Bookmark, History, Trash2, Play, Sparkles } from 'lucide-react';
import {
  getWatchlist,
  getWatchHistory,
  WatchHistoryItem,
  toggleWatchlist,
  clearWatchHistory,
  removeHistoryItem
} from '../api/animeApi';
import { AnimeMedia } from '../types/anime';
import { AnimePosterCard } from '../components/cards/AnimePosterCard';
import { SEO } from '../components/common/SEO';

export const WatchlistPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') === 'history' ? 'history' : 'watchlist';

  const [watchlist, setWatchlist] = useState<AnimeMedia[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [wl, hist] = await Promise.all([
        getWatchlist(),
        getWatchHistory()
      ]);
      setWatchlist(wl);
      setHistory(hist);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('watchlist_updated', loadData);
    window.addEventListener('history_updated', loadData);
    return () => {
      window.removeEventListener('watchlist_updated', loadData);
      window.removeEventListener('history_updated', loadData);
    };
  }, []);

  const handleRemoveFromWatchlist = async (anime: AnimeMedia) => {
    await toggleWatchlist(anime);
    setWatchlist((prev) => prev.filter((i) => i.id !== anime.id));
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire watch history?')) {
      await clearWatchHistory();
      setHistory([]);
    }
  };

  const handleRemoveHistoryItem = async (anilistId: number) => {
    await removeHistoryItem(anilistId);
    setHistory((prev) => prev.filter((i) => i.anilistId !== anilistId));
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
        <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex rounded-xl bg-[#23252B] p-1 border border-[#4A4E58]/40">
          <button
            onClick={() => setTab('watchlist')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition ${
              currentTab === 'watchlist'
                ? 'bg-[#F47521] text-black shadow'
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Watchlist ({watchlist.length})</span>
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition ${
              currentTab === 'history'
                ? 'bg-[#F47521] text-black shadow'
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="w-full min-h-[40vh] flex flex-col items-center justify-center gap-3 text-white">
          <div className="w-10 h-10 rounded-full border-4 border-[#F47521] border-t-transparent animate-spin" />
          <p className="text-xs text-[#A0A0A0]">Loading your watchlist...</p>
        </div>
      ) : currentTab === 'watchlist' ? (
        /* Watchlist View */
        watchlist.length === 0 ? (
          <div className="w-full py-20 text-center bg-[#23252B]/40 rounded-2xl border border-white/5 space-y-4">
            <Bookmark className="w-12 h-12 text-[#A0A0A0] mx-auto stroke-1" />
            <div className="space-y-1">
              <p className="text-base font-bold text-white">Your Watchlist is empty</p>
              <p className="text-xs text-[#A0A0A0] max-w-sm mx-auto">
                Explore popular anime and click "Add to Watchlist" or the bookmark icon to save titles here.
              </p>
            </div>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 bg-[#F47521] hover:bg-[#FF8533] text-black font-bold px-5 py-2.5 rounded-lg text-xs transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {watchlist.map((anime) => (
              <div key={anime.id} className="relative group">
                <AnimePosterCard anime={anime} />
                <button
                  onClick={() => handleRemoveFromWatchlist(anime)}
                  className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/80 hover:bg-red-500 text-white transition opacity-0 group-hover:opacity-100"
                  title="Remove from Watchlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        /* History View */
        history.length === 0 ? (
          <div className="w-full py-20 text-center bg-[#23252B]/40 rounded-2xl border border-white/5 space-y-4">
            <History className="w-12 h-12 text-[#A0A0A0] mx-auto stroke-1" />
            <div className="space-y-1">
              <p className="text-base font-bold text-white">No watch history yet</p>
              <p className="text-xs text-[#A0A0A0] max-w-sm mx-auto">
                When you watch episodes, they'll appear here so you can pick right back up where you left off.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#F47521] hover:bg-[#FF8533] text-black font-bold px-5 py-2.5 rounded-lg text-xs transition"
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
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.map((item) => {
                const anime = item.media;
                const title = anime?.title?.english || anime?.title?.romaji || `Anime #${item.anilistId}`;
                const resumeUrl = `/watch/${item.anilistId}/ep/${item.episodeNumber}`;
                const thumbnail = anime?.bannerImage || anime?.coverImage?.large || '';

                return (
                  <div
                    key={`${item.anilistId}_${item.episodeNumber}`}
                    className="flex flex-col rounded-xl overflow-hidden bg-[#23252B] border border-[#4A4E58]/30 group hover:border-[#F47521]/60 transition"
                  >
                    <Link to={resumeUrl} className="relative aspect-video w-full bg-black block overflow-hidden">
                      <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-10 h-10 rounded-full bg-[#F47521] flex items-center justify-center text-black">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 z-10">
                        <span className="bg-black/80 text-[10px] font-bold px-2 py-0.5 rounded text-white border border-white/10">
                          {item.media?.format === 'MOVIE' ? 'Watch Movie' : `Resume Ep ${item.episodeNumber}`}
                        </span>
                      </div>
                    </Link>

                    <div className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={resumeUrl}
                          className="text-sm font-bold text-white hover:text-[#F47521] transition line-clamp-1 flex-1"
                        >
                          {title}
                        </Link>
                        <button
                          onClick={() => handleRemoveHistoryItem(item.anilistId)}
                          className="text-[#A0A0A0] hover:text-red-400 p-1 rounded transition opacity-0 group-hover:opacity-100"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[#A0A0A0]">
                        Episode {item.episodeNumber} • {new Date(item.watchedAt).toLocaleDateString()}
                      </p>
                      <Link
                        to={resumeUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F47521] hover:underline pt-1"
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
