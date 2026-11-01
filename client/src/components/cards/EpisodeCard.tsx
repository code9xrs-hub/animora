import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle2 } from 'lucide-react';
import { EpisodeItemDTO } from '../../types/anime';
import { getWatchUrl } from '../../lib/slug';
import { getHighResEpisodeThumbnail } from '../../lib/imageUtils';

interface EpisodeCardProps {
  anilistId: number;
  episode: EpisodeItemDTO;
  animeTitle?: string;
  seasonNumber?: number;
  isActive?: boolean;
  isWatched?: boolean;
  progressPercent?: number;
}

export const EpisodeCardBase: React.FC<EpisodeCardProps> = ({
  anilistId,
  episode,
  animeTitle,
  seasonNumber = 1,
  isActive = false,
  isWatched = false,
  progressPercent = 0
}) => {
  const effectiveSeason = episode.seasonNumber || seasonNumber || 1;
  const watchUrl = animeTitle
    ? getWatchUrl({ id: anilistId, title: animeTitle }, effectiveSeason, episode.episodeNumber)
    : `/watch/${anilistId}/ep/${episode.episodeNumber}`;

  return (
    <div
      className={`group relative flex flex-col rounded-xl overflow-hidden bg-[#16181F] border transition-all duration-200 ${
        isActive
          ? 'border-[#F47521] ring-1 ring-[#F47521]/60 shadow-md shadow-[#F47521]/15'
          : 'border-white/[0.07] hover:border-white/20 hover:bg-[#1A1C24]'
      }`}
    >
      {/* Compact Standard 16:9 Thumbnail Container */}
      <Link to={watchUrl} state={{ anilistId }} className="relative aspect-video w-full overflow-hidden bg-black block">
        <img
          src={getHighResEpisodeThumbnail(episode.thumbnailUrl)}
          alt={episode.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F47521] flex items-center justify-center text-black shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Episode Number Badge (Top Left) */}
        <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
          <span className="bg-black/80 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded text-white border border-white/10">
            E{episode.episodeNumber}
          </span>
        </div>

        {/* Watched Indicator (Top Right) */}
        {isWatched && (
          <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 bg-emerald-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Watched</span>
          </div>
        )}

        {/* Duration Badge (Bottom Right) */}
        <div className="absolute bottom-1.5 right-1.5 z-10 pointer-events-none">
          <span className="bg-black/80 backdrop-blur-md text-[9px] font-mono text-[#A0A0A0] px-1.5 py-0.5 rounded border border-white/5">
            {episode.durationMinutes || 24}m
          </span>
        </div>

        {/* Watched Progress Bar */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-[#F47521]"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        )}
      </Link>

      {/* Episode Content Below Thumbnail */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-start justify-between gap-1.5">
            <Link
              to={watchUrl}
              state={{ anilistId }}
              className={`text-xs font-semibold line-clamp-1 hover:text-[#F47521] transition ${
                isActive ? 'text-[#F47521]' : 'text-white/90'
              }`}
              title={episode.displayTitle || episode.title}
            >
              {episode.displayTitle || (episode.title?.toLowerCase().startsWith('episode') ? episode.title : `Episode ${episode.episodeNumber}: ${episode.title}`)}
            </Link>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#8E93A0] mt-0.5 font-normal">
            Season {effectiveSeason} • Episode {episode.episodeNumber}
          </p>
        </div>


      </div>
    </div>
  );
};

export const EpisodeCard = memo(EpisodeCardBase);
