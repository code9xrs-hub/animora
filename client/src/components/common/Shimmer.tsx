import React from 'react';

/**
 * Single Anime Poster Card Shimmer
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex flex-col space-y-2 select-none ${className}`}>
    {/* Poster Aspect Ratio 2:3 */}
    <div className="w-full aspect-[2/3] rounded-lg animate-shimmer border border-[#2B2E38]/40 overflow-hidden" />
    {/* Title Line */}
    <div className="w-4/5 h-3.5 rounded animate-shimmer" />
    {/* Subtitle / Metadata Line */}
    <div className="w-1/2 h-2.5 rounded animate-shimmer opacity-70" />
  </div>
);

/**
 * Horizontal Media Swimlane Shimmer
 */
export const SwimlaneSkeleton: React.FC = () => (
  <section className="relative w-full py-6 select-none">
    {/* Swimlane Header */}
    <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-48 sm:w-64 h-6 sm:h-7 rounded-md animate-shimmer" />
        <div className="hidden sm:block w-32 h-4 rounded animate-shimmer opacity-60" />
      </div>
      <div className="w-16 h-4 rounded animate-shimmer opacity-60" />
    </div>

    {/* Cards Horizontal Rail */}
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  </section>
);

/**
 * Hero Banner Carousel Shimmer
 */
export const HeroBannerSkeleton: React.FC = () => (
  <div className="relative w-full aspect-[16/10] xs:aspect-[16/9] sm:aspect-[21/9] md:aspect-auto md:h-[480px] lg:h-[540px] xl:h-[600px] min-h-[240px] max-h-[85vh] bg-[#0E1015] overflow-hidden select-none animate-shimmer">
    {/* Dark Gradients overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#141519] via-[#141519]/70 via-50% to-transparent md:hidden" />
    <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#141519]/95 via-[#141519]/60 via-45% to-transparent" />
    <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#141519] via-[#141519]/25 via-20% to-transparent" />

    {/* Content Container Skeleton */}
    <div className="relative z-10 max-w-[1440px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-7 sm:pb-12 md:pb-16">
      <div className="max-w-2xl space-y-3 sm:space-y-4">
        {/* Badges Line */}
        <div className="flex items-center gap-2">
          <div className="w-20 h-5 rounded animate-shimmer" />
          <div className="w-14 h-5 rounded animate-shimmer" />
          <div className="w-24 h-5 rounded animate-shimmer opacity-60" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="w-3/4 sm:w-2/3 h-7 sm:h-12 rounded-lg animate-shimmer" />
          <div className="w-1/2 h-6 sm:h-10 rounded-lg animate-shimmer" />
        </div>

        {/* Genres Line */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-3.5 rounded animate-shimmer opacity-60" />
          <div className="w-20 h-3.5 rounded animate-shimmer opacity-60" />
          <div className="w-16 h-3.5 rounded animate-shimmer opacity-60" />
        </div>

        {/* Synopsis Lines */}
        <div className="space-y-2 pt-1 hidden xs:block">
          <div className="w-full h-3.5 rounded animate-shimmer opacity-70" />
          <div className="w-5/6 h-3.5 rounded animate-shimmer opacity-70" />
          <div className="w-2/3 h-3.5 rounded animate-shimmer opacity-70" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-32 sm:w-40 h-10 sm:h-12 rounded-lg animate-shimmer border border-[#F47521]/30" />
          <div className="w-28 sm:w-32 h-10 sm:h-12 rounded-lg animate-shimmer opacity-70" />
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg animate-shimmer opacity-50" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Full HomePage Shimmer (Hero Banner + 3 Swimlanes)
 */
export const HomePageSkeleton: React.FC = () => (
  <div className="w-full pb-16 space-y-4">
    <HeroBannerSkeleton />
    <SwimlaneSkeleton />
    <SwimlaneSkeleton />
    <SwimlaneSkeleton />
  </div>
);

/**
 * Grid Shimmer for Browse, Movies, and Watchlist
 */
export const GridSkeleton: React.FC<{ count?: number; title?: string }> = ({
  count = 18,
  title
}) => (
  <div className="w-full">
    {title && (
      <div className="mb-6 flex items-center justify-between">
        <div className="w-48 h-7 rounded animate-shimmer" />
        <div className="w-24 h-4 rounded animate-shimmer opacity-60" />
      </div>
    )}
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

/**
 * Series Details Page Shimmer
 */
export const SeriesDetailPageSkeleton: React.FC = () => (
  <div className="w-full pb-20 select-none">
    {/* Backdrop Banner Skeleton */}
    <div className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] bg-[#0E1015] animate-shimmer">
      <div className="absolute inset-0 bg-gradient-to-t from-[#141519] via-[#141519]/70 to-transparent" />
    </div>

    {/* Content Container */}
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-28 sm:-mt-36 relative z-10">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start">
        {/* Poster Card */}
        <div className="w-44 sm:w-56 md:w-64 aspect-[2/3] rounded-xl animate-shimmer shadow-2xl border border-[#2B2E38]/60 flex-shrink-0" />

        {/* Metadata Details */}
        <div className="flex-1 space-y-4 text-center md:text-left w-full">
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <div className="w-16 h-5 rounded animate-shimmer" />
            <div className="w-20 h-5 rounded animate-shimmer" />
            <div className="w-24 h-5 rounded animate-shimmer opacity-60" />
          </div>

          {/* Title */}
          <div className="w-3/4 h-8 sm:h-12 rounded-lg animate-shimmer mx-auto md:mx-0" />

          {/* Genres */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <div className="w-16 h-4 rounded animate-shimmer opacity-60" />
            <div className="w-20 h-4 rounded animate-shimmer opacity-60" />
            <div className="w-16 h-4 rounded animate-shimmer opacity-60" />
          </div>

          {/* Synopsis Paragraph */}
          <div className="space-y-2 pt-2 max-w-2xl mx-auto md:mx-0">
            <div className="w-full h-3.5 rounded animate-shimmer opacity-70" />
            <div className="w-full h-3.5 rounded animate-shimmer opacity-70" />
            <div className="w-4/5 h-3.5 rounded animate-shimmer opacity-70" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
            <div className="w-36 h-11 rounded-lg animate-shimmer border border-[#F47521]/30" />
            <div className="w-32 h-11 rounded-lg animate-shimmer opacity-70" />
          </div>
        </div>
      </div>

      {/* Episodes Rail / Grid Skeleton */}
      <div className="mt-12 sm:mt-16 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2B2E38]/60">
          <div className="w-36 h-6 rounded animate-shimmer" />
          <div className="w-24 h-8 rounded animate-shimmer opacity-60" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-xl bg-[#171920] border border-[#2B2E38]/40 animate-shimmer"
            >
              <div className="w-28 aspect-video rounded-lg animate-shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="w-3/4 h-3.5 rounded animate-shimmer" />
                <div className="w-1/2 h-2.5 rounded animate-shimmer opacity-60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Watch Page Player & Streams Shimmer
 */
export const WatchPageSkeleton: React.FC = () => (
  <div className="w-full pb-20 select-none">
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
      {/* 16:9 Cinema Player Skeleton */}
      <div className="w-full aspect-video rounded-xl sm:rounded-2xl bg-[#0E1015] animate-shimmer border border-[#2B2E38]/60 overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
          <div className="w-48 h-6 rounded animate-shimmer opacity-60" />
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full animate-shimmer" />
              <div className="w-24 h-4 rounded animate-shimmer opacity-70" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-7 rounded animate-shimmer" />
              <div className="w-8 h-8 rounded animate-shimmer opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Episode Header & Controls Skeleton */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="w-3/4 h-7 sm:h-9 rounded-lg animate-shimmer" />
          <div className="flex items-center gap-2">
            <div className="w-20 h-4 rounded animate-shimmer opacity-60" />
            <div className="w-16 h-4 rounded animate-shimmer opacity-60" />
            <div className="w-24 h-4 rounded animate-shimmer opacity-60" />
          </div>
          <div className="space-y-1.5 pt-2 max-w-xl">
            <div className="w-full h-3 rounded animate-shimmer opacity-60" />
            <div className="w-4/5 h-3 rounded animate-shimmer opacity-60" />
          </div>
        </div>

        {/* Server & Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="w-28 h-9 rounded-lg animate-shimmer border border-[#F47521]/30" />
          <div className="w-24 h-9 rounded-lg animate-shimmer opacity-70" />
          <div className="w-24 h-9 rounded-lg animate-shimmer opacity-70" />
        </div>
      </div>

      {/* Episode Selector Strip Skeleton */}
      <div className="pt-6 border-t border-[#2B2E38]/50 space-y-3">
        <div className="w-32 h-5 rounded animate-shimmer" />
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg animate-shimmer border border-[#2B2E38]/30" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Calendar Page Schedule Shimmer
 */
export const CalendarPageSkeleton: React.FC = () => (
  <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 select-none">
    {/* Page Title & Week Selector */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="w-56 h-8 rounded-lg animate-shimmer" />
        <div className="w-40 h-4 rounded animate-shimmer opacity-60" />
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-10 sm:w-14 h-9 rounded-lg animate-shimmer opacity-70" />
        ))}
      </div>
    </div>

    {/* Day Grid Skeleton */}
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 pt-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);
