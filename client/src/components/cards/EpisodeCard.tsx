import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Download, CheckCircle2 } from 'lucide-react';
import { EpisodeItemDTO } from '../../types/anime';

interface EpisodeCardProps {
  anilistId: number;
  episode: EpisodeItemDTO;
  seasonNumber?: number;
  isActive?: boolean;
  isWatched?: boolean;
  progressPercent?: number;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({
  anilistId,
  episode,
  seasonNumber = 1,
  isActive = false,
  isWatched = false,
  progressPercent = 0
}) => {
  const effectiveSeason = episode.seasonNumber || seasonNumber || 1;
  const watchUrl = `/watch/${anilistId}/ep/${episode.episodeNumber}`;
  const targetId = episode.mirrorBoxStream?.externalId || anilistId;
  const downloadUrl = episode.mirrorBoxStream?.downloadUrl || `https://mirrorboxapi.web.app/download/tv/${targetId}/${effectiveSeason}/${episode.episodeNumber}`;

  return (
    <div
      className={`group relative flex flex-col rounded-xl overflow-hidden bg-[#181A20] border transition-all duration-200 ${
        isActive
          ? 'border-[#F47521] ring-1 ring-[#F47521]/60 shadow-lg shadow-[#F47521]/15'
          : 'border-white/[0.07] hover:border-white/20'
      }`}
    >
      {/* 16:9 Thumbnail Container */}
      <Link to={watchUrl} className="relative aspect-video w-full overflow-hidden bg-black block">
        <img
          src={episode.thumbnailUrl}
          alt={episode.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-11 h-11 rounded-full bg-[#F47521] flex items-center justify-center text-black shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
        </div>

        {/* Episode Number Badge (Top Left) */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <span className="bg-black/75 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md text-white border border-white/10">
            E{episode.episodeNumber}
          </span>
        </div>

        {/* Watched Indicator (Top Right) */}
        {isWatched && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
            <CheckCircle2 className="w-3 h-3" />
            <span>Watched</span>
          </div>
        )}

        {/* Duration Badge (Bottom Right) */}
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
          <span className="bg-black/75 backdrop-blur-md text-[10px] font-mono text-[#A0A0A0] px-1.5 py-0.5 rounded-md border border-white/5">
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
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              to={watchUrl}
              className={`text-xs sm:text-sm font-semibold line-clamp-1 hover:text-[#F47521] transition ${
                isActive ? 'text-[#F47521]' : 'text-white/90'
              }`}
            >
              {episode.displayTitle || (episode.title?.toLowerCase().startsWith('episode') ? episode.title : `Episode ${episode.episodeNumber}: ${episode.title}`)}
            </Link>
          </div>
          <p className="text-[11px] text-[#8E93A0] mt-1 font-normal">
            Season {effectiveSeason} • Episode {episode.episodeNumber}
          </p>
        </div>

        {/* Action Bar (Direct Download) */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <Link
            to={watchUrl}
            className="text-[#F47521] hover:text-[#FF8533] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Watch Now</span>
          </Link>

          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2ABDBB]/10 text-[#2ABDBB] hover:bg-[#2ABDBB] hover:text-black font-medium transition-all text-[11px] sm:text-xs"
            title="Download Episode"
          >
            <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  );
};
