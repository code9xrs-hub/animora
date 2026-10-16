import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Bookmark, Check } from 'lucide-react';
import { AnimeMedia } from '../../types/anime';
import { toggleWatchlist } from '../../api/animeApi';

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
  const playUrl = isMovie ? `/watch/${anime.id}` : `/watch/${anime.id}/ep/1`;

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
      <Link to={detailUrl} className="block relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#23252B] shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.03] group-hover:z-30">
        <img
          src={anime.coverImage?.extraLarge || anime.coverImage?.large}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Format & Score Badges (Default State) */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className="bg-black/75 backdrop-blur-sm text-[11px] font-bold px-2 py-0.5 rounded text-white uppercase tracking-wider">
            {anime.format || 'TV'}
          </span>
          {anime.averageScore && (
            <span className="bg-[#FAB818] text-black text-[11px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
              ★ {(anime.averageScore / 10).toFixed(1)}
            </span>
          )}
        </div>

        {/* Hover Drawer Overlay (Desktop hover with touch safety) */}
        <div
          className={`hidden sm:flex absolute inset-0 bg-[#23252B]/95 p-3.5 sm:p-4 flex-col justify-between transition-opacity duration-200 z-20 ${
            isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="space-y-1.5 sm:space-y-2">
            <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-tight">
              {title}
            </h4>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#A0A0A0]">
              <span className="text-[#FAB818] font-bold">
                {anime.averageScore ? `${anime.averageScore}% Match` : 'Popular'}
              </span>
              <span>•</span>
              <span>{isMovie ? 'Movie' : `${anime.episodes || '?'} Eps`}</span>
            </div>

            <p className="text-[11px] sm:text-xs text-[#A0A0A0] line-clamp-3 sm:line-clamp-4 leading-relaxed">
              {cleanDescription}
            </p>

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {anime.genres.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="text-[9px] sm:text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#4A4E58]/40">
            <button
              onClick={handlePlayClick}
              className="flex-1 bg-[#F47521] hover:bg-[#FF8533] text-black font-bold py-1.5 sm:py-2 px-2.5 sm:px-3 rounded text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition shadow"
            >
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              <span>{isMovie ? 'Play' : 'S1 E1'}</span>
            </button>

            <button
              onClick={handleBookmarkClick}
              className={`p-1.5 sm:p-2 rounded border transition ${
                isBookmarked
                  ? 'border-[#F47521] bg-[#F47521]/20 text-[#F47521]'
                  : 'border-[#4A4E58] bg-black/40 text-[#A0A0A0] hover:text-white hover:border-white'
              }`}
              title={isBookmarked ? 'In Watchlist' : 'Add to Watchlist'}
            >
              {isBookmarked ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>
      </Link>

      {/* Title & Metadata Below Card */}
      <div className="mt-1.5 sm:mt-2 space-y-0.5">
        <Link
          to={detailUrl}
          className="text-xs sm:text-sm font-semibold text-white line-clamp-1 hover:text-[#F47521] transition-colors"
          title={title}
        >
          {title}
        </Link>
        <p className="text-[10px] sm:text-xs text-[#A0A0A0] flex items-center gap-1.5">
          <span>{isMovie ? 'Feature Film' : 'Sub | Dub'}</span>
          {anime.seasonYear && (
            <>
              <span>•</span>
              <span>{anime.seasonYear}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
