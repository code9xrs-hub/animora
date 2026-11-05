import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Play, Timer, Sparkles } from 'lucide-react';
import { fetchAniKotoSchedule, AniKotoDaySchedule, AniKotoScheduleItem } from '../api/animeApi';
import { slugify } from '../lib/slug';
import { SEO } from '../components/common/SEO';
import { StatusMessage } from '../components/common/StatusMessage';

const WEEKDAYS = [
  { code: 'mon', name: 'Monday', short: 'Mon' },
  { code: 'tue', name: 'Tuesday', short: 'Tue' },
  { code: 'wed', name: 'Wednesday', short: 'Wed' },
  { code: 'thu', name: 'Thursday', short: 'Thu' },
  { code: 'fri', name: 'Friday', short: 'Fri' },
  { code: 'sat', name: 'Saturday', short: 'Sat' },
  { code: 'sun', name: 'Sunday', short: 'Sun' }
];

export const CalendarPage: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<Record<string, AniKotoDaySchedule>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nowUnix, setNowUnix] = useState<number>(() => Math.floor(Date.now() / 1000));

  // Determine current day code on mount (e.g. 'thu')
  const initialDayCode = useMemo(() => {
    const shortName = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
    const found = WEEKDAYS.find((w) => w.code === shortName);
    return found ? found.code : 'wed';
  }, []);

  const [selectedDay, setSelectedDay] = useState<string>(initialDayCode);

  // Real-time ticking interval every second for live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNowUnix(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch schedule from AniKoto worker API
  const loadSchedule = async (dayToFetch: string) => {
    try {
      setLoading(true);
      setError(null);

      // Find full day name (e.g. 'wednesday')
      const dayObj = WEEKDAYS.find((w) => w.code === dayToFetch);
      const dayParam = dayObj ? dayObj.name.toLowerCase() : 'wednesday';

      const res = await fetchAniKotoSchedule(dayParam);
      if (res && res.schedule) {
        setScheduleData(res.schedule);
        // If today is indicated by API and user is on initial load
        const todayEntry = Object.values(res.schedule).find((d) => d.is_today);
        if (todayEntry && !selectedDay) {
          setSelectedDay(todayEntry.day);
        }
      } else {
        throw new Error('No schedule data returned');
      }
    } catch (err: unknown) {
      console.error('Failed to load anime schedule:', err);
      setError(err instanceof Error ? err.message : 'Error loading schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule(selectedDay);
  }, [selectedDay]);

  const currentDaySchedule = scheduleData[selectedDay];
  const items: AniKotoScheduleItem[] = currentDaySchedule?.items || [];

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full pb-20">
      <SEO
        title="Anime Airing Schedule & Live Episode Countdown | Animora"
        description="Track weekly anime broadcast schedules and live episode releases on Animora."
      />

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#F47521]" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#F47521]">
            Weekly Airing Lineup
          </span>
        </div>
        <h1 className="font-display font-black text-xl sm:text-3xl text-white">
          Anime Airing Schedule
        </h1>
        <p className="text-xs sm:text-sm text-[#A0A0A0] mt-0.5 sm:mt-1">
          Stay up to date with new anime episodes airing this week. Live updates from AniKoto schedule.
        </p>
      </div>

      {/* 7-Day Weekday Selector Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 mb-6 sm:mb-8 border-b border-white/[0.08] pb-3 sm:pb-4" data-lenis-prevent>
        {WEEKDAYS.map((w) => {
          const isSelected = selectedDay === w.code;
          const dayData = scheduleData[w.code];
          const isToday = dayData?.is_today || w.code === initialDayCode;
          const count = dayData?.total_scheduled ?? dayData?.items?.length ?? 0;

          return (
            <button
              key={w.code}
              type="button"
              onClick={() => setSelectedDay(w.code)}
              className={`flex-shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#F47521] text-black shadow-md shadow-[#F47521]/15 font-bold'
                  : 'bg-[#181A22] text-white/90 hover:bg-[#20222B] border border-white/10'
              }`}
            >
              <span>
                {w.short}
                <span className="hidden sm:inline">{w.name.slice(3)}</span>
              </span>
              {isToday && (
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-black text-[#2ABDBB]' : 'bg-[#2ABDBB]/15 text-[#2ABDBB]'
                  }`}
                >
                  Today
                </span>
              )}
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                    isSelected ? 'bg-black/80 text-white font-bold' : 'bg-white/10 text-[#8E93A0]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Daily Schedule Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3.5 p-3.5 rounded-xl bg-[#1A1C24] border border-[#2B2E38]/50 animate-shimmer h-28"
            >
              <div className="w-16 h-full rounded-lg animate-shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2.5 py-1">
                <div className="w-3/4 h-4 rounded animate-shimmer" />
                <div className="w-1/2 h-3 rounded animate-shimmer opacity-60" />
                <div className="w-1/3 h-3 rounded animate-shimmer opacity-40" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <StatusMessage
          title="Failed to Load Schedule"
          description={error}
          onRetry={() => loadSchedule(selectedDay)}
        />
      ) : items.length === 0 ? (
        <div className="w-full py-16 text-center bg-[#181A22] rounded-2xl border border-white/[0.08] space-y-2 p-6">
          <p className="text-sm font-semibold text-white">
            No episodes scheduled for {WEEKDAYS.find((w) => w.code === selectedDay)?.name || selectedDay}.
          </p>
          <p className="text-xs text-[#8E93A0]">Select another day or check back closer to broadcast.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const epMatch = item.episode?.match(/\d+/);
            const epNum = epMatch ? parseInt(epMatch[0], 10) : 1;
            const titleSlug = slugify(item.title);
            const watchUrl = `/watch/${titleSlug}-1x${epNum}`;
            const detailUrl = `/series/${titleSlug}-season-1`;

            const itemTimeUnix = parseInt(item.timestamp, 10) || 0;
            const diffSeconds = itemTimeUnix - nowUnix;
            const isAired = item.airing_status === 'aired' || (itemTimeUnix > 0 && diffSeconds <= 0);

            const totalHours = Math.max(0, Math.floor(diffSeconds / 3600));
            const minutesRemaining = Math.max(0, Math.floor((diffSeconds % 3600) / 60));
            const secondsRemaining = Math.max(0, Math.floor(diffSeconds % 60));

            return (
              <div
                key={item.id}
                className="flex items-center gap-3.5 sm:gap-4 p-3 sm:p-3.5 rounded-xl bg-[#181A20] border border-white/[0.08] hover:border-white/20 transition-all group shadow-sm"
              >
                {/* Poster Thumbnail */}
                <Link
                  to={detailUrl}
                  className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-black border border-white/5 relative block"
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {item.audio_type && (
                    <span className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-xs text-[9px] font-bold text-[#F47521] px-1 py-0.2 rounded uppercase border border-white/10">
                      {item.audio_type}
                    </span>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="text-[11px] font-mono font-medium text-[#F47521] flex items-center gap-1 bg-[#F47521]/10 px-2 py-0.5 rounded-md border border-[#F47521]/20"
                        title="Broadcast Time"
                      >
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                      {!isAired ? (
                        <span className="text-[10px] font-mono font-medium text-[#2ABDBB] bg-[#2ABDBB]/10 px-1.5 py-0.5 rounded-md border border-[#2ABDBB]/20 flex items-center gap-1 shadow-sm">
                          <Timer className="w-2.5 h-2.5 text-[#2ABDBB] animate-pulse" />
                          <span>
                            {totalHours}h {String(minutesRemaining).padStart(2, '0')}m {String(secondsRemaining).padStart(2, '0')}s
                          </span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                          AIRED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/60 text-[#2ABDBB] border border-[#2ABDBB]/25 flex-shrink-0">
                      EP {epNum}
                    </span>
                  </div>

                  <Link
                    to={detailUrl}
                    className="text-xs sm:text-sm font-semibold text-white/90 group-hover:text-[#F47521] transition line-clamp-1"
                    title={item.title}
                  >
                    {item.title}
                  </Link>

                  {item.title_jp && (
                    <p className="text-[10px] text-[#8E93A0] line-clamp-1 mt-0.5 font-normal">
                      {item.title_jp}
                    </p>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    {isAired ? (
                      <Link
                        to={watchUrl}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-black bg-[#F47521] hover:bg-[#FF8533] px-3 py-1 rounded-lg transition-all shadow-sm"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch Ep {epNum}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-[#2ABDBB]">
                        <Clock className="w-3 h-3 animate-pulse" />
                        <span>{totalHours}h remaining</span>
                      </div>
                    )}

                    <Link
                      to={detailUrl}
                      className="text-xs font-medium text-[#8E93A0] hover:text-white px-2 py-0.5 rounded hover:bg-white/5 transition flex-shrink-0"
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
