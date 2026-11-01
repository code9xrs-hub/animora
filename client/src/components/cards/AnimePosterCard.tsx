import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Bookmark, Check } from 'lucide-react';
import { AnimeMedia } from '../../types/anime';
import { toggleWatchlist, getContinuePlayUrl } from '../../api/animeApi';
import { getAnimeUrl } from '../../lib/slug';
import { getHighResPoster } from '../../lib/imageUtils';
import { useIsInWatchlist, useWatchHistory } from '../../lib/userStore';

interface AnimePosterCardProps {
  anime: AnimeMedia;
}

const stripHtml = (html?: string) => (html ? html.replace(/<[^>]*>?/gm, '').trim() : '');

const AnimePosterCardBase: React.FC<AnimePosterCardProps> = ({ anime }) => {
  const navigate = useNavigate();
  const isBookmarked = useIsInWatchlist(anime.id);
  // Subscribing keeps the resume label in sync after the user watches something.
  useWatchHistory();

  const title = anime.title.english || anime.title.romaji || 'Untitled';
  const isMovie = anime.format === 'MOVIE';
  const detailUrl = getAnimeUrl(anime);
  const continueInfo = getContinuePlayUrl(anime);
  const seasonNum = anime.seasonNumber || continueInfo.seasonNumber || 1;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const description = stripHtml(anime.description) || 'No synopsis available.';
  const last = continueInfo.lastWatched;

  const playLabel = isMovie
    ? 'Play'
    : last
      ? last.seasonNumber && last.seasonNumber > 1
        ? `Resume S${last.seasonNumber} E${last.episodeNumber}`
        : `Resume E${last.episodeNumber}`
      : `S${seasonNum} E1`;

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(anime);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(continueInfo.url, { state: { anilistId: anime.id } });
  };

  return (
    <div className="group relative flex flex-col w-full text-left">
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#181A22] border border-white/[0.06] shadow-sm transition-[transform,box-shadow,border-color] duration-300 group-hover:shadow-xl group-hover:shadow-black/40 group-hover:border-white/20 sm:group-hover:-translate-y-1">
        <Link to={detailUrl} state={{ anilistId: anime.id }} aria-label={title} className="absolute inset-0 block">
          <img
            src={getHighResPoster(anime)}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Format & Score Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 pointer-events-none">
          <span className="bg-black/75 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md text-white/90 uppercase tracking-wide border border-white/10">
            {anime.format || 'TV'}
          </span>
          {score && (
            <span className="bg-[#FAB818] text-black text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
              ★ {score}
            </span>
          )}
        </div>

        {/* Bookmark is always reachable on touch devices (no hover there) */}
        <button
          type="button"
          onClick={handleBookmarkClick}
          aria-label={isBookmarked ? `Remove ${title} from watchlist` : `Add ${title} to watchlist`}
          aria-pressed={isBookmarked}
          className={`sm:hidden absolute top-2 right-2 z-10 p-1.5 rounded-lg backdrop-blur-md border transition-colors ${
            isBookmarked
              ? 'bg-[#F47521] text-black border-[#F47521]'
              : 'bg-black/60 text-white border-white/15'
          }`}
        >
          {isBookmarked ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>

        {/* Hover drawer (desktop) — pure CSS, no per-card state */}
        <div className="hidden sm:flex absolute inset-0 z-20 flex-col justify-between bg-[#14151B]/95 backdrop-blur-md p-3.5 sm:p-4 opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
          <Link to={detailUrl} state={{ anilistId: anime.id }} tabIndex={-1} className="space-y-2 min-h-0 overflow-hidden">
            <h4 className="font-semibold text-xs sm:text-sm text-white line-clamp-2 leading-snug">{title}</h4>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#9AA0A6]">
              <span className="text-[#FAB818] font-semibold">{score ? `★ ${score}` : 'Popular'}</span>
              <span aria-hidden="true">•</span>
              <span>{isMovie ? 'Movie' : `S${seasonNum} • ${anime.episodes || '?'} Eps`}</span>
            </div>

            <p className="text-[11px] text-[#9AA0A6] line-clamp-3 md:line-clamp-4 leading-relaxed">{description}</p>

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
          </Link>

          <div className="flex items-center gap-2 pt-2.5 border-t border-white/10">
            <button
              type="button"
              onClick={handlePlayClick}
              className="flex-1 min-w-0 bg-[#F47521] hover:bg-[#FF8533] text-black font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current flex-shrink-0" />
              <span className="truncate">{playLabel}</span>
            </button>

            <button
              type="button"
              onClick={handleBookmarkClick}
              aria-label={isBookmarked ? `Remove ${title} from watchlist` : `Add ${title} to watchlist`}
              aria-pressed={isBookmarked}
              title={isBookmarked ? 'In Watchlist' : 'Add to Watchlist'}
              className={`p-2 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'border-[#F47521] bg-[#F47521]/15 text-[#F47521]'
                  : 'border-white/15 bg-white/5 text-[#9AA0A6] hover:text-white hover:border-white/30'
              }`}
            >
              {isBookmarked ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Title & Metadata Below Card */}
      <div className="mt-2.5 space-y-1">
        <Link
          to={detailUrl}
          className="block text-xs sm:text-sm font-semibold text-white/95 line-clamp-1 hover:text-[#F47521] transition-colors leading-snug tracking-tight"
          title={title}
        >
          {title}
        </Link>
        <div className="flex items-center justify-between gap-1 w-full overflow-hidden whitespace-nowrap text-[10px] sm:text-[11px] text-[#8E93A0] leading-none pt-0.5 select-none">
          <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#F47521] bg-[#F47521]/15 border border-[#F47521]/30 px-1.5 py-0.5 rounded leading-none flex-shrink-0">
              {isMovie ? (
                'Movie'
              ) : (
                <>
                  <span className="sm:hidden">S{seasonNum}</span>
                  <span className="hidden sm:inline">Season {seasonNum}</span>
                </>
              )}
            </span>
            <span className="text-[9.5px] sm:text-[11px] text-[#2ABDBB] font-semibold tracking-tight flex-shrink-0">
              Sub | Dub
            </span>
          </div>
          {anime.seasonYear ? (
            <span className="text-[9.5px] sm:text-[11px] font-mono text-[#8E93A0] font-medium flex-shrink-0 ml-auto">
              {anime.seasonYear}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

/** Memoised: rails and grids re-render often, but a card only changes with its `anime` prop or store state. */
export const AnimePosterCard = memo(AnimePosterCardBase);
