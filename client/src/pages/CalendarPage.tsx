import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Play, ChevronLeft, ChevronRight, Timer } from 'lucide-react';
import { fetchCalendar } from '../api/animeApi';
import { AiringScheduleItem } from '../types/anime';
import { SEO } from '../components/common/SEO';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const CalendarPage: React.FC = () => {
  const [schedules, setSchedules] = useState<AiringScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nowUnix, setNowUnix] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return today;
  });

  // Real-time ticking interval every second for live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNowUnix(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadCalendar() {
      try {
        setLoading(true);
        const res = await fetchCalendar();
        setSchedules(res.schedules || []);
      } catch (err: any) {
        console.error('Failed to load release calendar:', err);
        setError(err.message || 'Error loading schedule');
      } finally {
        setLoading(false);
      }
    }
    loadCalendar();
  }, []);

  // Group schedules by weekday
  const groupedByDay: Record<string, AiringScheduleItem[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  };

  schedules.forEach((item) => {
    const date = new Date(item.airingAt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (groupedByDay[dayName]) {
      groupedByDay[dayName].push(item);
    }
  });

  const activeDayItems = groupedByDay[selectedDay] || [];

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full pb-20">
      <SEO
        title="Simulcast Airing Calendar & Live Episode Countdown"
        description="Track weekly simulcast anime broadcast schedules with real-time second-by-second countdowns on Animora."
      />
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#F47521]" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#F47521]">
            Weekly Simulcast Lineup
          </span>
        </div>
        <h1 className="font-display font-black text-xl sm:text-3xl text-white">
          Simulcast Airing Calendar
        </h1>
        <p className="text-xs sm:text-sm text-[#A0A0A0] mt-0.5 sm:mt-1">
          Stay up to date with new anime episodes airing this week. Times are automatically formatted in your local browser timezone.
        </p>
      </div>

      {/* 7-Day Weekday Selector Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 mb-6 sm:mb-8 border-b border-white/[0.08] pb-3 sm:pb-4" data-lenis-prevent>
        {WEEKDAYS.map((day) => {
          const count = groupedByDay[day]?.length || 0;
          const isSelected = selectedDay === day;
          const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const isToday = day === todayName;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 sm:gap-2 ${
                isSelected
                  ? 'bg-[#F47521] text-black shadow-md shadow-[#F47521]/15 font-bold'
                  : 'bg-[#181A22] text-white/90 hover:bg-[#20222B] border border-white/10'
              }`}
            >
              <span>{day.slice(0, 3)}<span className="hidden sm:inline">{day.slice(3)}</span></span>
              {isToday && (
                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                  isSelected ? 'bg-black text-[#2ABDBB]' : 'bg-[#2ABDBB]/15 text-[#2ABDBB]'
                }`}>
                  Today
                </span>
              )}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                  isSelected ? 'bg-black/80 text-white font-bold' : 'bg-white/10 text-[#8E93A0]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Daily Schedule 3/3 Column Row Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-2 select-none">
              <div className="w-full aspect-[2/3] rounded-xl bg-[#1A1C24] border border-[#2B2E38]/40 animate-shimmer overflow-hidden" />
              <div className="w-4/5 h-3.5 rounded bg-[#1A1C24] animate-shimmer" />
              <div className="w-1/2 h-2.5 rounded bg-[#1A1C24] opacity-70 animate-shimmer" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="w-full py-16 text-center text-red-400 font-medium">{error}</div>
      ) : activeDayItems.length === 0 ? (
        <div className="w-full py-16 text-center bg-[#181A22] rounded-2xl border border-white/[0.08] space-y-2 p-6">
          <p className="text-sm font-semibold text-white">No episodes scheduled for {selectedDay}.</p>
          <p className="text-xs text-[#8E93A0]">Select another day or check back closer to broadcast.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
          {activeDayItems.map((item) => {
            const date = new Date(item.airingAt * 1000);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const title = item.media.title.english || item.media.title.romaji || 'Untitled';
            const diffSeconds = item.airingAt - nowUnix;
            const isAired = diffSeconds <= 0;
            const totalHours = Math.max(0, Math.floor(diffSeconds / 3600));
            const minutesRemaining = Math.max(0, Math.floor((diffSeconds % 3600) / 60));
            const secondsRemaining = Math.max(0, Math.floor(diffSeconds % 60));
            const watchUrl = `/watch/${item.media.id}/ep/${item.episode}`;
            const detailUrl = `/series/${item.media.id}`;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col w-full text-left"
              >
                {/* 2:3 Poster Card with Live Badges */}
                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#181A22] border border-white/[0.08] shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-white/20">
                  <img
                    src={item.media.coverImage?.large || item.media.coverImage?.extraLarge}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient Shadow Overlays for badge clarity */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />

                  {/* Top Left: Local Airing Time */}
                  <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
                    <span className="bg-black/80 backdrop-blur-md text-[8.5px] sm:text-[10.5px] font-mono text-[#F47521] font-semibold px-1 sm:px-1.5 py-0.5 rounded border border-[#F47521]/30 flex items-center gap-0.5 shadow-sm">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{timeStr}</span>
                    </span>
                  </div>

                  {/* Top Right: Episode Number */}
                  <div className="absolute top-1.5 right-1.5 z-10 pointer-events-none">
                    <span className="bg-black/80 backdrop-blur-md text-[8.5px] sm:text-[10.5px] font-bold text-[#2ABDBB] px-1 sm:px-1.5 py-0.5 rounded border border-[#2ABDBB]/30 shadow-sm">
                      EP {item.episode}
                    </span>
                  </div>

                  {/* Bottom on Poster: Live Countdown or AIRED */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 z-10 pointer-events-none">
                    {!isAired ? (
                      <span className="w-full bg-black/85 backdrop-blur-md text-[8px] sm:text-[10px] font-mono font-medium text-[#2ABDBB] py-0.5 px-1 rounded border border-[#2ABDBB]/30 flex items-center justify-center gap-1 truncate shadow-sm">
                        <Timer className="w-2 h-2 sm:w-2.5 sm:h-2.5 animate-pulse flex-shrink-0" />
                        <span className="truncate">
                          <span className="sm:hidden">{totalHours}h {minutesRemaining}m</span>
                          <span className="hidden sm:inline">{totalHours}h {minutesRemaining}m {secondsRemaining}s</span>
                        </span>
                      </span>
                    ) : (
                      <span className="bg-emerald-500/90 text-black font-extrabold text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded shadow-sm inline-block">
                        AIRED
                      </span>
                    )}
                  </div>

                  {/* Play Hover Overlay */}
                  <Link
                    to={isAired ? watchUrl : detailUrl}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    title={isAired ? `Watch Episode ${item.episode}` : title}
                  >
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#F47521] text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
                    </div>
                  </Link>
                </div>

                {/* Title & Action Below Card */}
                <div className="mt-1.5 sm:mt-2 space-y-0.5">
                  <Link
                    to={detailUrl}
                    className="block text-[11px] sm:text-xs md:text-sm font-semibold text-white/95 line-clamp-1 hover:text-[#F47521] transition-colors leading-tight tracking-tight"
                    title={title}
                  >
                    {title}
                  </Link>
                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    {isAired ? (
                      <Link
                        to={watchUrl}
                        className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-[#F47521] hover:text-[#FF8533] transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Watch Ep {item.episode}</span>
                      </Link>
                    ) : (
                      <span className="text-[8.5px] sm:text-[10.5px] font-mono text-[#8E93A0]">
                        In {totalHours}h {minutesRemaining}m
                      </span>
                    )}
                    <Link
                      to={detailUrl}
                      className="text-[8.5px] sm:text-[10.5px] text-[#8E93A0] hover:text-white transition-colors"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
