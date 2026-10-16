import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Bookmark, Check, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { AnimeMedia } from '../../types/anime';
import { toggleWatchlist } from '../../api/animeApi';

interface HeroBannerCarouselProps {
  items: AnimeMedia[];
}

const INTERVAL_MS = 6500;

export const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = ({ items }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  const activeItem = items[currentIndex];

  // Check if active item is in watchlist
  useEffect(() => {
    if (!activeItem) return;
    try {
      const stored = localStorage.getItem('animora_watchlist') || localStorage.getItem('crunchyroll_watchlist');
      if (stored) {
        const list = JSON.parse(stored);
        setIsBookmarked(list.some((i: any) => i.id === activeItem.id));
      } else {
        setIsBookmarked(false);
      }
    } catch {
      setIsBookmarked(false);
    }
  }, [activeItem]);

  // Auto-advance progress animation & interval
  useEffect(() => {
    if (!items.length) return;

    setProgress(0);
    const step = 100 / (INTERVAL_MS / 50);
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + step;
      });
    }, 50);

    const advanceTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, INTERVAL_MS);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(advanceTimer);
    };
  }, [currentIndex, items.length]);

  if (!activeItem) return null;

  const title = activeItem.title.english || activeItem.title.romaji || 'Featured Anime';
  const isMovie = activeItem.format === 'MOVIE';
  const playUrl = isMovie ? `/watch/${activeItem.id}` : `/watch/${activeItem.id}/ep/1`;
  const detailUrl = isMovie ? `/movie/${activeItem.id}` : `/series/${activeItem.id}`;
  const banner = activeItem.bannerImage || activeItem.coverImage?.extraLarge || activeItem.coverImage?.large;

  const handleBookmarkToggle = async () => {
    const added = await toggleWatchlist(activeItem);
    setIsBookmarked(added);
  };

  const cleanDescription = activeItem.description
    ? activeItem.description.replace(/<[^>]*>?/gm, '').trim()
    : 'Stream the full season in crisp HD with multi-server playback and direct download options.';

  return (
    <div className="relative w-full h-[480px] sm:h-[550px] md:h-[620px] bg-[#000000] overflow-hidden select-none">
      {/* Background Banner with Crunchyroll Vignette */}
      <div className="absolute inset-0">
        <img
          src={banner}
          alt={title}
          className="w-full h-full object-cover object-top opacity-55 transition-opacity duration-700 filter brightness-90"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141519] via-[#141519]/85 via-50% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141519] via-transparent to-black/40" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1440px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="bg-[#F47521] text-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              {isMovie ? 'FEATURE FILM' : 'SERIES'}
            </span>
            {activeItem.averageScore && (
              <span className="bg-[#FAB818] text-black px-2 py-0.5 rounded font-black flex items-center gap-1">
                ★ {(activeItem.averageScore / 10).toFixed(1)} ({activeItem.averageScore}% Match)
              </span>
            )}
            <span className="bg-[#2B2E36] text-white px-2 py-0.5 rounded">
              {isMovie ? 'Movie' : `${activeItem.episodes || 12} Episodes`}
            </span>
            <span className="text-[#2ABDBB] font-semibold">
              Sub | Dub Available
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-black text-xl sm:text-3xl md:text-5xl text-white tracking-tight leading-tight drop-shadow-md">
            {title}
          </h1>

          {/* Genres */}
          {activeItem.genres && activeItem.genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#A0A0A0]">
              {activeItem.genres.slice(0, 3).map((genre, idx) => (
                <React.Fragment key={genre}>
                  <span className="text-white/80">{genre}</span>
                  {idx < Math.min(2, activeItem.genres.length - 1) && <span>•</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Clamped Synopsis */}
          <p className="text-xs sm:text-base text-[#D0D0D0] line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl drop-shadow">
            {cleanDescription}
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
            <button
              onClick={() => navigate(playUrl)}
              className="bg-[#F47521] hover:bg-[#FF8533] text-black font-extrabold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-[#F47521]/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>{isMovie ? 'WATCH MOVIE' : 'WATCH S1 E1'}</span>
            </button>

            <button
              onClick={handleBookmarkToggle}
              className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border transition ${
                isBookmarked
                  ? 'border-[#F47521] bg-[#F47521]/20 text-[#F47521]'
                  : 'border-white/30 bg-black/40 text-white hover:bg-white/10'
              }`}
            >
              {isBookmarked ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span className="hidden xs:inline">{isBookmarked ? 'IN WATCHLIST' : 'WATCHLIST'}</span>
            </button>

            <Link
              to={detailUrl}
              className="p-2.5 sm:p-3 rounded-lg border border-white/20 bg-black/30 text-[#A0A0A0] hover:text-white hover:bg-white/10 transition"
              title="Series Details"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>

        {/* Carousel Bottom Controls & Indicators */}
        <div className="absolute right-4 sm:right-8 bottom-3 sm:bottom-8 flex items-center gap-2 sm:gap-3 z-20">
          {/* Arrow Buttons (Hidden on tiny screens to avoid text overlay) */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
            className="hidden sm:flex w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 border border-white/20 text-white items-center justify-center hover:bg-[#F47521] hover:text-black hover:border-[#F47521] transition"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
            className="hidden sm:flex w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 border border-white/20 text-white items-center justify-center hover:bg-[#F47521] hover:text-black hover:border-[#F47521] transition"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Interactive Progress Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`relative h-1.5 sm:h-2 rounded-full overflow-hidden transition-all duration-300 ${
                  index === currentIndex ? 'w-6 sm:w-8 bg-white/30' : 'w-1.5 sm:w-2 bg-white/20 hover:bg-white/40'
                }`}
                title={item.title.english || item.title.romaji}
              >
                {index === currentIndex && (
                  <div
                    className="absolute top-0 left-0 bottom-0 bg-[#F47521] rounded-full transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
