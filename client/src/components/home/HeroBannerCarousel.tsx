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
    <div className="relative w-full h-[390px] xs:h-[430px] sm:h-[500px] md:h-[580px] lg:h-[620px] bg-[#000000] overflow-hidden select-none">
      {/* Background Banner with Crystal-Clear Art */}
      <div className="absolute inset-0">
        <img
          src={banner}
          alt={title}
          className="w-full h-full object-cover object-[center_top] sm:object-center md:object-[right_center] opacity-90 transition-all duration-700 filter brightness-105 contrast-[1.02]"
        />
        {/* Mobile Gradient: Natural bottom fade so the artwork at the top is completely unblocked & vibrant */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141519] via-[#141519]/75 via-50% to-transparent md:hidden" />
        {/* Desktop Gradients: Left-to-right fade leaving the right artwork pristine */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#141519]/95 via-[#141519]/60 via-40% to-transparent" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#141519] via-[#141519]/25 via-20% to-transparent" />
        {/* Top Vignette for Navbar legibility */}
        <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b from-black/60 to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1440px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-7 sm:pb-12 md:pb-16">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold">
            <span className="bg-[#F47521] text-black px-2 sm:px-2.5 py-0.5 rounded-md uppercase tracking-wider font-bold">
              {isMovie ? 'FEATURE FILM' : 'SERIES'}
            </span>
            {activeItem.averageScore && (
              <span className="bg-[#FAB818] text-black px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                ★ {(activeItem.averageScore / 10).toFixed(1)}
              </span>
            )}
            <span className="bg-[#1A1C24]/90 backdrop-blur-md border border-white/10 text-white/90 px-2 py-0.5 rounded-md">
              {isMovie ? 'Movie' : `${activeItem.episodes || 12} Episodes`}
            </span>
            <span className="text-[#2ABDBB] font-medium">
              Sub | Dub Available
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-extrabold text-xl sm:text-3xl md:text-5xl text-white tracking-tight leading-tight drop-shadow-md">
            {title}
          </h1>

          {/* Genres */}
          {activeItem.genres && activeItem.genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9AA0A6]">
              {activeItem.genres.slice(0, 3).map((genre, idx) => (
                <React.Fragment key={genre}>
                  <span className="text-white/80 font-medium">{genre}</span>
                  {idx < Math.min(2, activeItem.genres.length - 1) && <span className="text-white/30">•</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Clamped Synopsis */}
          <p className="hidden xs:line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm md:text-base text-[#D0D0D0] leading-relaxed max-w-xl drop-shadow">
            {cleanDescription}
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            <button
              onClick={() => navigate(playUrl)}
              className="bg-[#F47521] hover:bg-[#FF8533] text-black font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#F47521]/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
              <span>{isMovie ? 'WATCH MOVIE' : 'WATCH S1 E1'}</span>
            </button>

            <button
              onClick={handleBookmarkToggle}
              className={`px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition-all ${
                isBookmarked
                  ? 'border-[#F47521] bg-[#F47521]/15 text-[#F47521]'
                  : 'border-white/20 bg-black/40 backdrop-blur-sm text-white hover:bg-white/10'
              }`}
            >
              {isBookmarked ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span className="hidden xs:inline">{isBookmarked ? 'IN WATCHLIST' : 'WATCHLIST'}</span>
            </button>

            <Link
              to={detailUrl}
              className="p-2.5 sm:p-3 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm text-[#9AA0A6] hover:text-white hover:bg-white/10 transition-all"
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
            className="hidden sm:flex w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white/90 items-center justify-center hover:bg-[#F47521] hover:text-black hover:border-[#F47521] transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
            className="hidden sm:flex w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white/90 items-center justify-center hover:bg-[#F47521] hover:text-black hover:border-[#F47521] transition-all"
          >
            <ChevronRight className="w-4 h-4" />
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
