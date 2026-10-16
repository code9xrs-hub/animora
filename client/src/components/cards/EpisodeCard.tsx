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
  const downloadUrl = episode.mirrorBoxStream?.downloadUrl || `https://mirrorboxapi.web.app/download/tv/${anilistId}/${effectiveSeason}/${episode.episodeNumber}`;

  return (
    <div
      className={`group relative flex flex-col rounded-xl overflow-hidden bg-[#23252B] border transition-all duration-200 ${
        isActive
          ? 'border-[#F47521] ring-1 ring-[#F47521] shadow-lg shadow-[#F47521]/10'
          : 'border-[#4A4E58]/40 hover:border-[#A0A0A0]/60'
      }`}
    >
      {/* 16:9 Thumbnail Container */}
      <Link to={watchUrl} className="relative aspect-video w-full overflow-hidden bg-black block">
        <img
          src={episode.thumbnailUrl}
          alt={episode.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-12 h-12 rounded-full bg-[#F47521] flex items-center justify-center text-black shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Episode Number Badge (Top Left) */}
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-black/80 backdrop-blur-sm text-[11px] font-bold px-2 py-0.5 rounded text-white border border-white/10">
            E{episode.episodeNumber}
          </span>
        </div>

        {/* Watched Indicator (Top Right) */}
        {isWatched && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
            <CheckCircle2 className="w-3 h-3" />
            <span>Watched</span>
          </div>
        )}

        {/* Duration Badge (Bottom Right) */}
        <div className="absolute bottom-2 right-2 z-10">
          <span className="bg-black/80 backdrop-blur-sm text-[11px] font-mono text-[#A0A0A0] px-1.5 py-0.5 rounded">
            {episode.durationMinutes || 24}m
          </span>
        </div>

        {/* Watched Progress Bar */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#4A4E58]">
            <div
              className="h-full bg-[#F47521]"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        )}
      </Link>

      {/* Episode Content Below Thumbnail */}
      <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              to={watchUrl}
              className={`text-xs sm:text-sm font-bold line-clamp-1 hover:text-[#F47521] transition ${
                isActive ? 'text-[#F47521]' : 'text-white'
              }`}
            >
              {episode.displayTitle || (episode.title?.toLowerCase().startsWith('episode') ? episode.title : `Episode ${episode.episodeNumber}: ${episode.title}`)}
            </Link>
          </div>
          <p className="text-[10px] sm:text-xs text-[#A0A0A0] mt-0.5 sm:mt-1 font-medium">
            Season {effectiveSeason} • Episode {episode.episodeNumber}
          </p>
        </div>

        {/* Action Bar (Direct Download) */}
        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#4A4E58]/30 flex items-center justify-between text-[11px] sm:text-xs">
          <Link
            to={watchUrl}
            className="text-[#F47521] hover:text-[#FF8533] font-semibold flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Watch Now</span>
          </Link>

          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-[#2ABDBB]/15 text-[#2ABDBB] hover:bg-[#2ABDBB] hover:text-black font-semibold transition"
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
