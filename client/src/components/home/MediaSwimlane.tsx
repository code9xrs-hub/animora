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
    <section className="relative w-full py-6 select-none">
      {/* Swimlane Header */}
      <div className="flex items-end justify-between mb-4 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="font-display font-black text-base sm:text-2xl text-white tracking-tight">
            {title}
          </h2>
          {badge && (
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-[#F47521]/20 text-[#F47521] border border-[#F47521]/30 uppercase tracking-wider">
              {badge}
            </span>
          )}
          {subtitle && (
            <span className="hidden md:inline-block text-xs text-[#A0A0A0]">
              {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-[11px] sm:text-xs font-bold text-[#F47521] hover:text-[#FF8533] transition"
            >
              VIEW ALL →
            </Link>
          )}

          {/* Scroll Arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-full bg-[#23252B] hover:bg-[#F47521] hover:text-black text-white transition border border-[#4A4E58]/40"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-full bg-[#23252B] hover:bg-[#F47521] hover:text-black text-white transition border border-[#4A4E58]/40"
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
