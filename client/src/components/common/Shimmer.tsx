import React from 'react';

/**
 * 1. Single Anime Poster Card Shimmer
 * Perfectly matches AnimePosterCard dimensions (2:3 aspect-ratio, rounded-2xl, and below-card metadata)
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex flex-col space-y-2 select-none ${className}`}>
    {/* 2:3 Crisp Poster */}
    <div className="relative w-full aspect-[2/3] rounded-2xl animate-shimmer border border-white/[0.08] overflow-hidden shadow-md">
      <div className="absolute top-2 left-2 w-12 h-4 rounded-md animate-shimmer opacity-80" />
    </div>
    {/* Title Line */}
    <div className="w-4/5 h-3.5 rounded-md animate-shimmer" />
    {/* Single-Line Metadata Row (Format on left, Year on right) */}
    <div className="flex items-center justify-between gap-1 w-full pt-0.5">
      <div className="w-12 h-3.5 rounded animate-shimmer opacity-80" />
      <div className="w-8 h-3.5 rounded animate-shimmer opacity-50 ml-auto" />
    </div>
  </div>
);

/**
 * 2. Horizontal Media Swimlane Shimmer
 * Perfectly matches MediaSwimlane layout with header, horizontal rail, and exact card widths
 */
export const SwimlaneSkeleton: React.FC = () => (
  <section className="relative w-full py-3.5 sm:py-5 select-none">
    {/* Swimlane Header */}
    <div className="flex items-end justify-between mb-3.5 sm:mb-4 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        <div className="w-44 sm:w-56 h-6 sm:h-7 rounded-xl animate-shimmer" />
        <div className="hidden md:inline-block w-48 h-4 rounded-lg animate-shimmer opacity-50" />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-16 h-4 rounded-lg animate-shimmer opacity-60" />
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full animate-shimmer opacity-40" />
          <div className="w-8 h-8 rounded-full animate-shimmer opacity-40" />
        </div>
      </div>
    </div>

    {/* Horizontal Scroll Track matching MediaSwimlane */}
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex gap-3 sm:gap-4 overflow-hidden py-1 sm:py-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[138px] xs:w-40 sm:w-44 md:w-52 lg:w-56"
          >
            <CardSkeleton />
          </div>
        ))}
      </div>
    </div>
  </section>
);

/**
 * 3. Hero Banner Carousel Shimmer
 * Matches HeroBannerCarousel with full-bleed aspect ratios, cinema gradients, and CTA overlays
 */
export const HeroBannerSkeleton: React.FC = () => (
  <div className="relative w-full aspect-[16/10] xs:aspect-[16/9] sm:aspect-[21/9] md:aspect-auto md:h-[500px] lg:h-[560px] xl:h-[620px] min-h-[280px] max-h-[85vh] bg-[#0A0B0E] overflow-hidden select-none animate-shimmer">
    {/* Directional Cinema Gradients */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#141519] via-[#141519]/70 via-40% to-transparent md:hidden" />
    <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#141519]/90 via-[#141519]/45 via-40% to-transparent" />
    <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#141519] via-[#141519]/25 via-20% to-transparent" />

    {/* Slide Content Overlay Skeleton */}
    <div className="absolute inset-0 z-20 max-w-[1440px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-6 xs:pb-7 sm:pb-8 md:pb-12">
      <div className="max-w-2xl space-y-2.5 sm:space-y-3.5">
        {/* Badges Row */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-5 rounded-md animate-shimmer bg-[#F47521]/20 border border-[#F47521]/30" />
          <div className="w-14 h-5 rounded-md animate-shimmer bg-[#FAB818]/20" />
          <div className="w-20 h-5 rounded-md animate-shimmer opacity-60" />
          <div className="w-14 h-5 rounded-md animate-shimmer opacity-40" />
        </div>

        {/* Multi-line Title */}
        <div className="space-y-2">
          <div className="w-3/4 sm:w-2/3 h-7 sm:h-11 rounded-xl animate-shimmer" />
          <div className="w-1/2 h-6 sm:h-9 rounded-xl animate-shimmer opacity-70" />
        </div>

        {/* Genres Strip */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="w-16 h-4 rounded-md animate-shimmer opacity-50" />
          <div className="w-14 h-4 rounded-md animate-shimmer opacity-50" />
          <div className="w-20 h-4 rounded-md animate-shimmer opacity-50" />
        </div>

        {/* Synopsis Lines */}
        <div className="space-y-2 pt-1 hidden sm:block max-w-xl">
          <div className="w-full h-3.5 rounded animate-shimmer opacity-70" />
          <div className="w-5/6 h-3.5 rounded animate-shimmer opacity-70" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 pt-1">
          <div className="w-32 sm:w-40 h-9 sm:h-11 rounded-xl animate-shimmer bg-[#F47521]/25 border border-[#F47521]/40" />
          <div className="w-24 sm:w-28 h-9 sm:h-11 rounded-xl animate-shimmer border border-white/10" />
          <div className="w-24 sm:w-28 h-9 sm:h-11 rounded-xl animate-shimmer border border-white/10" />
        </div>
      </div>
    </div>

    {/* Bottom Dots */}
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`h-2 rounded-full animate-shimmer ${i === 0 ? 'w-6 bg-[#F47521]/60' : 'w-2 opacity-30'}`} />
      ))}
    </div>
  </div>
);

/**
 * 4. Full HomePage Shimmer (Hero Banner + 3 Swimlanes)
 */
export const HomePageSkeleton: React.FC = () => (
  <div className="w-full pb-16 space-y-2 sm:space-y-4">
    <HeroBannerSkeleton />
    <SwimlaneSkeleton />
    <SwimlaneSkeleton />
    <SwimlaneSkeleton />
  </div>
);

/**
 * 5. Grid Shimmer for Browse, Movies, and Watchlist
 */
export const GridSkeleton: React.FC<{ count?: number; title?: string }> = ({
  count = 18,
  title
}) => (
  <div className="w-full">
    {title && (
      <div className="mb-6 flex items-center justify-between">
        <div className="w-48 h-7 rounded-xl animate-shimmer" />
        <div className="w-24 h-4 rounded-lg animate-shimmer opacity-60" />
      </div>
    )}
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

/**
 * 6. Series Details Page Shimmer
 * Perfectly matches SeriesDetailPage (Atmospheric Header, Poster, Actions, and 12-col episode grid)
 */
export const SeriesDetailPageSkeleton: React.FC = () => (
  <div className="w-full pb-20 select-none">
    {/* Atmospheric Backdrop Header */}
    <div className="relative w-full min-h-[420px] lg:min-h-[480px] bg-black overflow-hidden flex items-end animate-shimmer border-b border-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-t from-[#141519] via-[#141519]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#141519] via-[#141519]/70 to-transparent" />

      {/* Foreground Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
        {/* 2:3 Crisp Poster */}
        <div className="w-36 sm:w-52 md:w-60 flex-shrink-0 aspect-[2/3] rounded-2xl animate-shimmer shadow-2xl ring-1 ring-white/10" />

        {/* Title & Metadata Info */}
        <div className="flex-1 space-y-3 sm:space-y-4 text-center md:text-left w-full">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <div className="w-16 h-5 rounded-md animate-shimmer bg-[#F47521]/20 border border-[#F47521]/30" />
            <div className="w-20 h-5 rounded-md animate-shimmer bg-[#FAB818]/20" />
            <div className="w-20 h-5 rounded-md animate-shimmer opacity-60" />
            <div className="w-16 h-5 rounded-md animate-shimmer opacity-50" />
          </div>

          <div className="w-3/4 sm:w-2/3 h-8 sm:h-12 rounded-xl animate-shimmer mx-auto md:mx-0" />
          <div className="w-1/3 h-4 rounded animate-shimmer opacity-50 mx-auto md:mx-0" />

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 pt-2">
            <div className="w-36 sm:w-44 h-10 sm:h-12 rounded-xl animate-shimmer bg-[#F47521]/25 border border-[#F47521]/40" />
            <div className="w-32 sm:w-36 h-10 sm:h-12 rounded-xl animate-shimmer bg-[#2ABDBB]/15 border border-[#2ABDBB]/30" />
            <div className="w-28 sm:w-32 h-10 sm:h-12 rounded-xl animate-shimmer border border-white/15" />
            <div className="w-11 sm:w-12 h-10 sm:h-12 rounded-xl animate-shimmer border border-white/15" />
          </div>
        </div>
      </div>
    </div>

    {/* 12-Column Main Content Grid */}
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      {/* Left Column (8 cols): Synopsis, Season Selector & Episode Grid */}
      <div className="lg:col-span-8 space-y-6 sm:space-y-8">
        {/* Synopsis Box */}
        <div className="bg-[#181A20] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-3 sm:space-y-4">
          <div className="w-24 h-4 rounded animate-shimmer opacity-60" />
          <div className="space-y-2 pt-1">
            <div className="w-full h-3.5 rounded animate-shimmer opacity-70" />
            <div className="w-full h-3.5 rounded animate-shimmer opacity-70" />
            <div className="w-4/5 h-3.5 rounded animate-shimmer opacity-70" />
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
            <div className="w-16 h-6 rounded-full animate-shimmer opacity-50" />
            <div className="w-20 h-6 rounded-full animate-shimmer opacity-50" />
            <div className="w-16 h-6 rounded-full animate-shimmer opacity-50" />
          </div>
        </div>

        {/* Season Selector Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full animate-shimmer opacity-70" />
              <div className="w-44 h-6 rounded-lg animate-shimmer" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 sm:w-44 h-8 rounded-xl animate-shimmer border border-white/10" />
              <div className="w-8 h-8 rounded-xl animate-shimmer border border-white/10" />
            </div>
          </div>

          {/* 3-Column Episode Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-[#16181F] border border-white/[0.07] p-0 space-y-2">
                <div className="aspect-video w-full animate-shimmer" />
                <div className="p-2 space-y-1.5">
                  <div className="w-3/4 h-3 rounded animate-shimmer" />
                  <div className="w-1/2 h-2.5 rounded animate-shimmer opacity-60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column (4 cols): Details & Information Sidebar */}
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-[#181A20] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          <div className="w-32 h-5 rounded animate-shimmer border-b border-white/[0.06] pb-2" />
          <div className="space-y-3 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-white/[0.04]">
                <div className="w-20 h-3 rounded animate-shimmer opacity-50" />
                <div className="w-24 h-3 rounded animate-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * 7. Watch Page Cinema Player & Side-by-Side Queue Shimmer
 * Perfectly matches WatchPage (8-col Cinema Player on left, 4-col Episode Queue on right)
 */
export const WatchPageSkeleton: React.FC = () => (
  <div className="w-full pb-20 select-none">
    <div className="max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-5 space-y-5 sm:space-y-6">
      {/* Desktop 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column (8 cols): Player & Below-Player Info */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* 16:9 Cinema Player Skeleton */}
          <div className="relative aspect-video w-full rounded-xl bg-[#141519] border border-white/10 shadow-2xl animate-shimmer overflow-hidden flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#1A1C24] border border-[#F47521]/40 flex items-center justify-center animate-pulse shadow-lg shadow-[#F47521]/20">
              <div className="w-6 h-6 rounded bg-[#F47521]/60" />
            </div>
          </div>

          {/* Action Bar (Lights, Fullscreen, Servers, Download) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-[#16181F] px-3 sm:px-4 py-2 border border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-20 sm:w-24 h-7 rounded-xl animate-shimmer" />
              <div className="w-20 sm:w-24 h-7 rounded-xl animate-shimmer" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-14 h-6 rounded-lg animate-shimmer bg-[#F47521]/20" />
              <div className="w-14 h-6 rounded-lg animate-shimmer bg-[#2ABDBB]/20" />
              <div className="w-14 h-6 rounded-lg animate-shimmer bg-[#FAB818]/20" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-7 rounded-xl animate-shimmer" />
              <div className="w-24 h-7 rounded-xl animate-shimmer bg-[#2ABDBB]/20" />
            </div>
          </div>

          {/* Below-Player Anime Info Box */}
          <div className="bg-[#181A20] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
              <div className="space-y-1.5 flex-1">
                <div className="w-32 h-3.5 rounded animate-shimmer opacity-60" />
                <div className="w-3/4 sm:w-1/2 h-6 sm:h-7 rounded-lg animate-shimmer" />
              </div>
              <div className="w-24 h-8 rounded-xl animate-shimmer border border-white/10" />
            </div>

            {/* Metadata strip */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-3.5 rounded animate-shimmer opacity-60" />
              <div className="w-16 h-3.5 rounded animate-shimmer bg-[#FAB818]/20" />
              <div className="w-16 h-3.5 rounded animate-shimmer opacity-60" />
              <div className="w-28 h-3.5 rounded animate-shimmer bg-[#2ABDBB]/15" />
            </div>

            {/* Characters Avatars Row */}
            <div className="pt-2 border-t border-white/[0.06] space-y-2">
              <div className="w-36 h-3.5 rounded animate-shimmer opacity-60" />
              <div className="flex items-center gap-3 overflow-hidden py-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center flex-shrink-0 w-16 space-y-1.5">
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full animate-shimmer border-2 border-white/10" />
                    <div className="w-12 h-2.5 rounded animate-shimmer opacity-60" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Episode Queue List Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#181A20] border border-white/[0.08] rounded-2xl p-4 shadow-sm space-y-3">
            {/* Queue Header with Season Selector */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full animate-shimmer bg-[#F47521]/60" />
                <div className="w-36 h-4 rounded animate-shimmer" />
              </div>
              <div className="w-24 h-7 rounded-lg animate-shimmer border border-[#F47521]/40" />
            </div>

            {/* Up Next Card */}
            <div className="p-2.5 rounded-xl bg-[#14151B] border border-[#F47521]/30 flex items-center gap-2.5">
              <div className="w-16 aspect-video rounded-md animate-shimmer flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="w-3/4 h-3 rounded animate-shimmer" />
                <div className="w-1/2 h-2.5 rounded animate-shimmer opacity-60" />
              </div>
            </div>

            {/* Scrollable Queue Items */}
            <div className="space-y-1.5 pt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-[#121318] border border-white/5"
                >
                  <div className="w-16 aspect-video rounded-md animate-shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-4/5 h-3 rounded animate-shimmer" />
                    <div className="w-12 h-2.5 rounded animate-shimmer opacity-60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * 8. Calendar / Schedule Page Shimmer
 * Perfectly matches CalendarPage with 7-day tabs and 3-column daily schedule cards
 */
export const CalendarPageSkeleton: React.FC = () => (
  <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full pb-20 space-y-6 select-none">
    {/* Page Header */}
    <div className="space-y-2 mb-6">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full animate-shimmer bg-[#F47521]/60" />
        <div className="w-32 h-3.5 rounded animate-shimmer bg-[#F47521]/20" />
      </div>
      <div className="w-64 h-8 sm:h-9 rounded-xl animate-shimmer" />
      <div className="w-96 max-w-full h-3.5 rounded animate-shimmer opacity-60" />
    </div>

    {/* 7-Day Tabs Strip */}
    <div className="flex gap-2 border-b border-white/[0.08] pb-3 sm:pb-4 overflow-hidden">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className={`flex-shrink-0 px-4 py-2.5 rounded-xl border ${
            i === 0
              ? 'bg-[#F47521]/25 border-[#F47521]/50 w-24 h-9'
              : 'bg-[#181A22] border-white/10 w-20 h-9 opacity-70'
          } animate-shimmer`}
        />
      ))}
    </div>

    {/* 3-Column Daily Schedule Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3.5 sm:gap-4 p-3 sm:p-3.5 rounded-xl bg-[#181A20] border border-white/[0.08] animate-shimmer"
        >
          {/* Poster Thumbnail */}
          <div className="w-16 h-24 flex-shrink-0 rounded-lg animate-shimmer border border-white/5" />
          {/* Details */}
          <div className="flex-1 space-y-2 py-1 min-w-0">
            <div className="flex justify-between items-center gap-2">
              <div className="w-20 h-4 rounded animate-shimmer bg-[#F47521]/15" />
              <div className="w-12 h-4 rounded animate-shimmer bg-[#2ABDBB]/15" />
            </div>
            <div className="w-4/5 h-4 rounded animate-shimmer" />
            <div className="w-1/2 h-3 rounded animate-shimmer opacity-50" />
            <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
              <div className="w-24 h-6 rounded-lg animate-shimmer bg-[#F47521]/20" />
              <div className="w-14 h-4 rounded animate-shimmer opacity-40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
