import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimeMedia } from '../../types/anime';
import { AnimePosterCard } from '../cards/AnimePosterCard';

interface MediaSwimlaneProps {
  title: string;
  subtitle?: string;
  items: AnimeMedia[];
  viewAllLink?: string;
  badge?: string;
}

export const MediaSwimlane: React.FC<MediaSwimlaneProps> = ({
  title,
  subtitle,
  items,
  viewAllLink,
  badge
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative w-full py-3.5 sm:py-5 select-none">
      {/* Swimlane Header */}
      <div className="flex items-end justify-between mb-3.5 sm:mb-4 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <h2 className="font-display font-bold text-lg sm:text-xl md:text-2xl text-white tracking-tight">
            {title}
          </h2>
          {badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F47521]/15 text-[#F47521] border border-[#F47521]/25 uppercase tracking-wider">
              {badge}
            </span>
          )}
          {subtitle && (
            <span className="hidden md:inline-block text-xs text-[#8E93A0] font-normal">
              {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs font-semibold text-[#F47521] hover:text-[#FF8533] transition-colors inline-flex items-center gap-1 group"
            >
              <span>View All</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          )}

          {/* Scroll Arrows */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 sm:p-2 rounded-full bg-[#181A20] hover:bg-[#F47521] hover:text-black text-white/80 transition-all border border-white/[0.08] shadow-sm"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 sm:p-2 rounded-full bg-[#181A20] hover:bg-[#F47521] hover:text-black text-white/80 transition-all border border-white/[0.08] shadow-sm"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 sm:py-2"
        >
          {items.map((anime) => (
            <div
              key={anime.id}
              className="flex-shrink-0 w-32 sm:w-44 md:w-52 lg:w-56"
            >
              <AnimePosterCard anime={anime} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
