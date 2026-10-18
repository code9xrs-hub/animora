import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Bookmark, Check, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { AnimeMedia } from '../../types/anime';
import { toggleWatchlist, getContinuePlayUrl } from '../../api/animeApi';

interface HeroBannerCarouselProps {
  items: AnimeMedia[];
}

const INTERVAL_MS = 5000;

export const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = ({ items }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watchlistSet, setWatchlistSet] = useState<Set<number>>(new Set());

  // Real-time mobile touch-scroll tracking state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  // Sync Watchlist state
  useEffect(() => {
    try {
      const stored = localStorage.getItem('animora_watchlist') || localStorage.getItem('crunchyroll_watchlist');
      if (stored) {
        const list = JSON.parse(stored);
        setWatchlistSet(new Set(list.map((i: any) => i.id)));
      }
    } catch {}
  }, [items]);

  // Clean auto-advance timer (Pauses during active touch drag)
  useEffect(() => {
    if (!items.length || isDragging) return;

    const advanceTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, INTERVAL_MS);

    return () => {
      clearTimeout(advanceTimer);
    };
  }, [currentIndex, items.length, isDragging]);

  // Real-Time Touch Drag / Scroll System
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startXRef.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startXRef.current;
    const deltaY = currentY - startYRef.current;

    // Detect gesture direction on initial movement
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    // Do not interfere if user is scrolling vertically
    if (isHorizontalSwipeRef.current === false) return;

    if (isHorizontalSwipeRef.current === true) {
      // Apply smooth resistance at track boundaries
      let offset = deltaX;
      if (
        (currentIndex === 0 && deltaX > 0) ||
        (currentIndex === items.length - 1 && deltaX < 0)
      ) {
        offset = deltaX * 0.35;
      }
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (isHorizontalSwipeRef.current === true) {
      const threshold = 45; // 45px drag threshold to change slide
      if (dragOffset < -threshold && currentIndex < items.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (dragOffset > threshold && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    }
    setDragOffset(0);
    startXRef.current = 0;
    startYRef.current = 0;
    isHorizontalSwipeRef.current = null;
  };

  const handleBookmarkToggle = async (e: React.MouseEvent, item: AnimeMedia) => {
    e.stopPropagation();
    const added = await toggleWatchlist(item);
    setWatchlistSet((prev) => {
      const next = new Set(prev);
      if (added) next.add(item.id);
      else next.delete(item.id);
      return next;
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full aspect-[16/10] xs:aspect-[16/9] sm:aspect-[21/9] md:aspect-auto md:h-[480px] lg:h-[540px] xl:h-[600px] min-h-[240px] max-h-[85vh] bg-[#0A0B0E] overflow-hidden select-none"
    >
      {/* Horizontal Touch-Scroll Slide Track */}
      <div
        className={`flex h-full w-full ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`
        }}
      >
        {items.map((item, index) => {
          const itemBanner = item.bannerImage || item.coverImage?.extraLarge || item.coverImage?.large;
          const itemTitle = item.title.english || item.title.romaji || 'Featured Anime';
          const isMovie = item.format === 'MOVIE';
          const continueInfo = getContinuePlayUrl(item);
          const playUrl = continueInfo.url;
          const playLabel = continueInfo.label;
          const detailUrl = isMovie ? `/movie/${item.id}` : `/series/${item.id}`;
          const isBookmarked = watchlistSet.has(item.id);

          const cleanDescription = item.description
            ? item.description.replace(/<[^>]*>?/gm, '').trim()
            : 'Stream the full season in crisp HD with multi-server playback and direct download options.';

          return (
            <div
              key={item.id}
              className="relative min-w-full w-full h-full flex-shrink-0 overflow-hidden bg-[#0A0B0E]"
            >
              {/* Ambient Blurred Backdrop for full bleed tone */}
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-40 scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${itemBanner})` }}
              />

              {/* Crisp Main Artwork Image Centered Perfectly */}
              <img
                src={itemBanner}
                alt={itemTitle}
                decoding="async"
                className="relative w-full h-full object-cover object-center filter brightness-105"
              />

              {/* Mobile Gradient: Soft bottom fade so upper 65% of artwork is completely unblocked */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#141519] via-[#141519]/70 via-40% to-transparent md:hidden pointer-events-none" />

              {/* Desktop Gradients: Subtle cinema fade preserving full artwork visibility */}
              <div className="hidden md:block absolute inset-0 z-10 bg-gradient-to-r from-[#141519]/90 via-[#141519]/45 via-40% to-transparent pointer-events-none" />
              <div className="hidden md:block absolute inset-0 z-10 bg-gradient-to-t from-[#141519] via-[#141519]/25 via-20% to-transparent pointer-events-none" />

              {/* Top Vignette for Navbar legibility */}
              <div className="absolute top-0 left-0 right-0 h-14 sm:h-20 z-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

              {/* Slide Content Overlay */}
              <div className="absolute inset-0 z-20 max-w-[1440px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-3 xs:pb-4 sm:pb-8 md:pb-12 pointer-events-none">
                <div className="max-w-2xl space-y-1.5 xs:space-y-2 sm:space-y-3 pointer-events-auto">
                  {/* Metadata Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold">
                    <span className="bg-[#F47521] text-black px-2 sm:px-2.5 py-0.5 rounded-md uppercase tracking-wider font-bold shadow-sm">
                      {isMovie ? 'FEATURE FILM' : 'SERIES'}
                    </span>
                    {item.averageScore && (
                      <span className="bg-[#FAB818] text-black px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-sm">
                        ★ {(item.averageScore / 10).toFixed(1)}
                      </span>
                    )}
                    <span className="bg-[#1A1C24]/90 backdrop-blur-md border border-white/10 text-white/90 px-2 py-0.5 rounded-md">
                      {isMovie ? 'Movie' : `${item.episodes || 12} Episodes`}
                    </span>
                    <span className="text-[#2ABDBB] font-medium hidden xs:inline">
                      Sub | Dub Available
                    </span>
                  </div>

                  {/* Heading (Full Title without truncation) */}
                  <h1 className="font-display font-extrabold text-base xs:text-lg sm:text-2xl md:text-4xl lg:text-5xl text-white tracking-tight leading-snug drop-shadow-md">
                    {itemTitle}
                  </h1>

                  {/* Genres */}
                  {item.genres && item.genres.length > 0 && (
                    <div className="hidden xs:flex flex-wrap items-center gap-2 text-xs text-[#9AA0A6]">
                      {item.genres.slice(0, 3).map((genre, idx) => (
                        <React.Fragment key={genre}>
                          <span className="text-white/80 font-medium">{genre}</span>
                          {idx < Math.min(2, item.genres.length - 1) && <span className="text-white/30">•</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Clamped Synopsis */}
                  <p className="hidden sm:line-clamp-2 md:line-clamp-3 text-xs sm:text-sm md:text-base text-[#D0D0D0] leading-relaxed max-w-xl drop-shadow">
                    {cleanDescription}
                  </p>

                  {/* CTA Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1">
                    <button
                      onClick={() => navigate(playUrl)}
                      className="bg-[#F47521] hover:bg-[#FF8533] text-black font-bold px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#F47521]/20 active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                      <span>{playLabel}</span>
                    </button>

                    <button
                      onClick={(e) => handleBookmarkToggle(e, item)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 border transition-all ${
                        isBookmarked
                          ? 'border-[#F47521] bg-[#F47521]/15 text-[#F47521]'
                          : 'border-white/20 bg-black/40 backdrop-blur-sm text-white hover:bg-white/10'
                      }`}
                    >
                      {isBookmarked ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span className="hidden xs:inline">{isBookmarked ? 'IN WATCHLIST' : 'WATCHLIST'}</span>
                    </button>

                    <button
                      onClick={() => navigate(detailUrl)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Details</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Left Navigation Arrow (Vertically Centered on Left Edge, Hidden on Mobile) */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
        className="hidden sm:flex absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-[#F47521] hover:text-black text-white/90 backdrop-blur-md border border-white/15 hover:border-[#F47521] items-center justify-center transition-all duration-200 z-30 shadow-lg active:scale-95 group"
        title="Previous Anime"
      >
        <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
      </button>

      {/* Right Navigation Arrow (Vertically Centered on Right Edge, Hidden on Mobile) */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
        className="hidden sm:flex absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-[#F47521] hover:text-black text-white/90 backdrop-blur-md border border-white/15 hover:border-[#F47521] items-center justify-center transition-all duration-200 z-30 shadow-lg active:scale-95 group"
        title="Next Anime"
      >
        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Interactive Progress Indicator Dots (Optimized for Mobile & Desktop) */}
      <div className="absolute right-3 xs:right-4 sm:right-8 bottom-2.5 xs:bottom-3.5 sm:bottom-6 flex items-center gap-1.5 sm:gap-2 z-30 bg-black/40 backdrop-blur-md px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-white/10 shadow-lg">
        {items.map((item, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-1.5 sm:h-2 rounded-full overflow-hidden transition-all duration-300 focus:outline-none ${
                isActive
                  ? 'w-5 sm:w-8 bg-white/30'
                  : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/60 active:scale-90'
              }`}
              title={item.title.english || item.title.romaji}
              aria-label={`Go to slide ${index + 1}`}
            >
              {isActive && (
                <div
                  key={currentIndex}
                  className="absolute top-0 left-0 bottom-0 bg-[#F47521] rounded-full animate-hero-progress"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
