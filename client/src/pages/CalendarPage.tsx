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
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 mb-6 sm:mb-8 border-b border-[#2B2E36] pb-3 sm:pb-4" data-lenis-prevent>
        {WEEKDAYS.map((day) => {
          const count = groupedByDay[day]?.length || 0;
          const isSelected = selectedDay === day;
          const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const isToday = day === todayName;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1.5 sm:gap-2 ${
                isSelected
                  ? 'bg-[#F47521] text-black shadow-lg shadow-[#F47521]/20'
                  : 'bg-[#23252B] text-white hover:bg-[#2B2E36] border border-[#4A4E58]/30'
              }`}
            >
              <span>{day.slice(0, 3)}<span className="hidden sm:inline">{day.slice(3)}</span></span>
              {isToday && (
                <span className={`text-[9px] uppercase px-1 py-0.2 rounded font-black ${
                  isSelected ? 'bg-black text-[#2ABDBB]' : 'bg-[#2ABDBB]/20 text-[#2ABDBB]'
                }`}>
                  Today
                </span>
              )}
              <span
                className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-black text-white font-extrabold' : 'bg-white/10 text-[#A0A0A0]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Daily Schedule List */}
      {loading ? (
        <div className="w-full min-h-[40vh] flex flex-col items-center justify-center gap-3 text-white">
          <div className="w-10 h-10 rounded-full border-4 border-[#F47521] border-t-transparent animate-spin" />
          <p className="text-xs text-[#A0A0A0]">Loading airing schedule...</p>
        </div>
      ) : error ? (
        <div className="w-full py-16 text-center text-red-400">{error}</div>
      ) : activeDayItems.length === 0 ? (
        <div className="w-full py-16 text-center bg-[#23252B]/40 rounded-2xl border border-white/5 space-y-2">
          <p className="text-sm font-bold text-white">No episodes scheduled for {selectedDay}.</p>
          <p className="text-xs text-[#A0A0A0]">Select another day or check back closer to broadcast.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeDayItems.map((item) => {
            const date = new Date(item.airingAt * 1000);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const title = item.media.title.english || item.media.title.romaji || 'Untitled';
            const diffSeconds = item.airingAt - nowUnix;
            const isAired = diffSeconds <= 0;
            const totalHours = Math.max(0, Math.floor(diffSeconds / 3600));
            const minutesRemaining = Math.max(0, Math.floor((diffSeconds % 3600) / 60));
            const secondsRemaining = Math.max(0, Math.floor(diffSeconds % 60));

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3.5 rounded-xl bg-[#23252B] border border-[#4A4E58]/30 hover:border-[#F47521]/60 transition group shadow"
              >
                {/* Poster image */}
                <Link
                  to={`/series/${item.media.id}`}
                  className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-black"
                >
                  <img
                    src={item.media.coverImage?.large || item.media.coverImage?.extraLarge}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-[#F47521] flex items-center gap-1 bg-[#F47521]/10 px-1.5 py-0.5 rounded border border-[#F47521]/20" title="Local Broadcast Time">
                        <Clock className="w-3 h-3" />
                        {timeStr}
                      </span>
                      {!isAired ? (
                        <span className="text-[10px] font-mono font-bold text-[#2ABDBB] bg-[#2ABDBB]/10 px-1.5 py-0.5 rounded border border-[#2ABDBB]/30 flex items-center gap-1 shadow-sm">
                          <Timer className="w-2.5 h-2.5 text-[#2ABDBB] animate-pulse" />
                          <span>{totalHours}h {String(minutesRemaining).padStart(2, '0')}m {String(secondsRemaining).padStart(2, '0')}s</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#A0A0A0] bg-white/5 px-1.5 py-0.5 rounded">
                          AIRED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-black/60 text-[#2ABDBB] border border-[#2ABDBB]/30 flex-shrink-0">
                      EP {item.episode}
                    </span>
                  </div>

                  <Link
                    to={`/series/${item.media.id}`}
                    className="text-sm font-bold text-white group-hover:text-[#F47521] transition line-clamp-1"
                    title={title}
                  >
                    {title}
                  </Link>

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    {isAired ? (
                      <Link
                        to={`/watch/${item.media.id}/ep/${item.episode}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-[#F47521] hover:bg-[#FF8533] px-3 py-1.5 rounded-lg transition shadow"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch Episode {item.episode}</span>
                      </Link>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#2ABDBB]">
                          <Clock className="w-3 h-3 animate-pulse" />
                          <span>{totalHours} {totalHours === 1 ? 'hour' : 'hours'} to release</span>
                        </div>
                        <span className="text-xs font-mono font-black text-white tracking-wider">
                          {totalHours}h {String(minutesRemaining).padStart(2, '0')}m {String(secondsRemaining).padStart(2, '0')}s
                        </span>
                      </div>
                    )}

                    <Link
                      to={`/series/${item.media.id}`}
                      className="text-[11px] font-semibold text-[#A0A0A0] hover:text-white px-2 py-1 rounded hover:bg-white/5 transition flex-shrink-0"
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
