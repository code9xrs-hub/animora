import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Bookmark, Check } from 'lucide-react';
import { AnimeMedia } from '../../types/anime';
import { toggleWatchlist, getContinuePlayUrl } from '../../api/animeApi';

interface AnimePosterCardProps {
  anime: AnimeMedia;
}

export const AnimePosterCard: React.FC<AnimePosterCardProps> = ({ anime }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const title = anime.title.english || anime.title.romaji || 'Untitled';
  const isMovie = anime.format === 'MOVIE';
  const detailUrl = isMovie ? `/movie/${anime.id}` : `/series/${anime.id}`;
  const continueInfo = getContinuePlayUrl(anime);
  const seasonNum = anime.seasonNumber || continueInfo.seasonNumber || 1;
  const playUrl = continueInfo.url;

  useEffect(() => {
    try {
      const stored = localStorage.getItem('animora_watchlist') || localStorage.getItem('crunchyroll_watchlist');
      if (stored) {
        const list = JSON.parse(stored);
        setIsBookmarked(list.some((item: any) => item.id === anime.id));
      }
    } catch {}
  }, [anime.id]);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = await toggleWatchlist(anime);
    setIsBookmarked(added);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(playUrl);
  };

  const cleanDescription = anime.description
    ? anime.description.replace(/<[^>]*>?/gm, '').trim()
    : 'No synopsis available.';

  return (
    <div
      className="group relative flex flex-col w-full text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={detailUrl}
        className="block relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#181A22] border border-white/[0.06] shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-white/20 group-hover:scale-[1.02] group-hover:z-30"
      >
        <img
          src={anime.coverImage?.extraLarge || anime.coverImage?.large}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Format & Score Badges (Default State) */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 pointer-events-none">
          <span className="bg-black/75 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md text-white/90 uppercase tracking-wide border border-white/10">
            {anime.format || 'TV'}
          </span>
          {anime.averageScore && (
            <span className="bg-[#FAB818] text-black text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
              ★ {(anime.averageScore / 10).toFixed(1)}
            </span>
          )}
        </div>

        {/* Hover Drawer Overlay (Desktop hover with touch safety) */}
        <div
          className={`hidden sm:flex absolute inset-0 bg-[#16171E]/95 backdrop-blur-md p-3.5 sm:p-4 flex-col justify-between transition-opacity duration-200 z-20 ${
            isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="space-y-2">
            <h4 className="font-semibold text-xs sm:text-sm text-white line-clamp-2 leading-snug">
              {title}
            </h4>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#9AA0A6]">
              <span className="text-[#FAB818] font-semibold">
                {anime.averageScore ? `★ ${(anime.averageScore / 10).toFixed(1)}` : 'Popular'}
              </span>
              <span>•</span>
              <span>{isMovie ? 'Movie' : `S${seasonNum} • ${anime.episodes || '?'} Eps`}</span>
            </div>

            <p className="text-[11px] text-[#9AA0A6] line-clamp-3 sm:line-clamp-4 leading-relaxed">
              {cleanDescription}
            </p>

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {anime.genres.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="text-[10px] bg-white/[0.08] text-gray-300 px-1.5 py-0.5 rounded border border-white/5 font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 pt-2.5 border-t border-white/10">
            <button
              onClick={handlePlayClick}
              className="flex-1 bg-[#F47521] hover:bg-[#FF8533] text-black font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {isMovie
                  ? 'Play'
                  : continueInfo.lastWatched
                    ? (continueInfo.lastWatched.seasonNumber && continueInfo.lastWatched.seasonNumber > 1
                        ? `Resume S${continueInfo.lastWatched.seasonNumber} E${continueInfo.lastWatched.episodeNumber}`
                        : `Resume E${continueInfo.lastWatched.episodeNumber}`)
                    : `S${seasonNum} E1`}
              </span>
            </button>

            <button
              onClick={handleBookmarkClick}
              className={`p-2 rounded-lg border transition-all ${
                isBookmarked
                  ? 'border-[#F47521] bg-[#F47521]/15 text-[#F47521]'
                  : 'border-white/15 bg-white/5 text-[#9AA0A6] hover:text-white hover:border-white/30'
              }`}
              title={isBookmarked ? 'In Watchlist' : 'Add to Watchlist'}
            >
              {isBookmarked ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Link>

      {/* Title & Metadata Below Card */}
      <div className="mt-2.5 space-y-1">
        <Link
          to={detailUrl}
          className="block text-xs sm:text-sm font-semibold text-white/95 line-clamp-1 hover:text-[#F47521] transition-colors leading-snug tracking-tight"
          title={title}
        >
          {title}
        </Link>
        <div className="flex items-center justify-between gap-1 text-[11px] text-[#8E93A0] leading-none pt-0.5">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-[#F47521] bg-[#F47521]/15 border border-[#F47521]/30 px-1.5 py-0.5 rounded leading-none flex-shrink-0 shadow-sm">
              {isMovie ? 'Movie' : <><span className="xs:hidden">S{seasonNum}</span><span className="hidden xs:inline">Season {seasonNum}</span></>}
            </span>
            <span className="text-[9.5px] sm:text-[11px] text-[#2ABDBB] font-medium tracking-tight truncate">
              Sub | Dub
            </span>
          </div>
          {anime.seasonYear && (
            <span className="text-[9.5px] sm:text-[11px] font-mono text-[#8E93A0] font-medium flex-shrink-0">
              {anime.seasonYear}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
