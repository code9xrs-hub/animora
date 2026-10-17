import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  fetchAnimeDetail,
  AnimeDetailResponse,
  recordHistory,
  toggleWatchlist
} from '../api/animeApi';
import { EpisodeItemDTO } from '../types/anime';
import { MirrorBoxPlayer } from '../components/player/MirrorBoxPlayer';
import { Play, Bookmark, Check, Download, ArrowLeft, Tv, Star, Film, Sparkles } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { WatchPageSkeleton } from '../components/common/Shimmer';

export const WatchPage: React.FC = () => {
  const { id, episodeNumber } = useParams<{ id: string; episodeNumber?: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<AnimeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const currentEpNum = episodeNumber ? parseInt(episodeNumber, 10) : 1;

  useEffect(() => {
    if (!id) return;
    async function loadDetail() {
      try {
        setLoading(true);
        const res = await fetchAnimeDetail(id!);
        setData(res);

        // Record watch history
        recordHistory(res.media.id, currentEpNum, 120, 1440, res.media);

        // Check watchlist
        const stored = localStorage.getItem('animora_watchlist') || localStorage.getItem('crunchyroll_watchlist');
        if (stored) {
          const list = JSON.parse(stored);
          setIsBookmarked(list.some((item: any) => item.id === res.media.id));
        }
      } catch (err: any) {
        console.error('Failed to load anime stream:', err);
        setError(err.message || 'Error loading playback');
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id, currentEpNum]);

  if (loading) {
    return <WatchPageSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-red-400">{error || 'Playback error'}</p>
        <Link to="/" className="bg-[#F47521] text-black font-bold px-4 py-2 rounded">
          Back to Home
        </Link>
      </div>
    );
  }

  const { media, episodes } = data;
  const isMovie = media.format === 'MOVIE';
  const title = media.title.english || media.title.romaji || 'Untitled';

  // Find active episode item
  const activeEpisodeIndex = episodes.findIndex((ep) => ep.episodeNumber === currentEpNum);
  const fallbackStream = episodes[0]?.mirrorBoxStream;
  const fallbackExternalId = fallbackStream?.externalId || String(media.id);
  const fallbackSeason = fallbackStream?.resolvedSeason || 1;

  const activeEpisode: EpisodeItemDTO = activeEpisodeIndex >= 0
    ? episodes[activeEpisodeIndex]
    : episodes[0] || {
        episodeNumber: currentEpNum,
        title: isMovie ? title : `Episode ${currentEpNum}`,
        thumbnailUrl: media.bannerImage || media.coverImage?.extraLarge || '',
        durationMinutes: 24,
        isAired: true,
        airingAtUnix: null,
        mirrorBoxStream: {
          provider: 'mirrorbox',
          mediaType: isMovie ? 'movie' : 'tv',
          externalId: fallbackExternalId,
          resolvedSeason: fallbackSeason,
          resolvedEpisode: isMovie ? 1 : currentEpNum,
          embedUrl: isMovie
            ? `https://mirrorboxapi.web.app/movie/${fallbackExternalId}`
            : `https://mirrorboxapi.web.app/tv/${fallbackExternalId}/${fallbackSeason}/${currentEpNum}`,
          downloadUrl: isMovie
            ? `https://mirrorboxapi.web.app/download/movie/${fallbackExternalId}`
            : `https://mirrorboxapi.web.app/download/tv/${fallbackExternalId}/${fallbackSeason}/${currentEpNum}`,
          availableServers: fallbackStream?.availableServers || ['Abyss', 'FileMoon', 'Vidmoly', 'Streamwish']
        }
      };

  const hasPrevEpisode = activeEpisodeIndex > 0;
  const hasNextEpisode = activeEpisodeIndex >= 0 && activeEpisodeIndex < episodes.length - 1;
  const nextEpisode = hasNextEpisode ? episodes[activeEpisodeIndex + 1] : null;

  const handleSelectPrev = () => {
    if (hasPrevEpisode) {
      navigate(`/watch/${media.id}/ep/${episodes[activeEpisodeIndex - 1].episodeNumber}`);
    }
  };

  const handleSelectNext = () => {
    if (hasNextEpisode) {
      navigate(`/watch/${media.id}/ep/${episodes[activeEpisodeIndex + 1].episodeNumber}`);
    }
  };

  const handleBookmarkToggle = async () => {
    const added = await toggleWatchlist(media);
    setIsBookmarked(added);
  };

  const seoTitle = isMovie
    ? `Watch ${title} Full Movie Online Free in HD`
    : `Watch ${title} Episode ${currentEpNum} Sub & Dub in HD`;
  const seoDesc = `Stream ${title} ${isMovie ? 'movie' : `Episode ${currentEpNum}`} in 1080p Full HD on Animora. High-speed multi-server streaming with subtitle and audio options.`;
  const seoImage = activeEpisode.thumbnailUrl || media.bannerImage || media.coverImage?.extraLarge;
  const canonicalUrl = isMovie
    ? `/watch/${media.id}`
    : `/watch/${media.id}/ep/${currentEpNum}`;

  const watchJsonLd = isMovie
    ? {
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: title,
        description: media.description?.replace(/<[^>]+>/g, '').slice(0, 200) || seoDesc,
        image: seoImage,
        genre: media.genres || [],
        url: typeof window !== 'undefined' ? window.location.href : canonicalUrl
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'TVEpisode',
        name: activeEpisode.title || `Episode ${currentEpNum}`,
        episodeNumber: currentEpNum,
        partOfSeries: {
          '@type': 'TVSeries',
          name: title
        },
        image: seoImage,
        description: media.description?.replace(/<[^>]+>/g, '').slice(0, 200) || seoDesc,
        url: typeof window !== 'undefined' ? window.location.href : canonicalUrl
      };

  return (
    <div className="w-full pb-20">
      <SEO
        title={seoTitle}
        description={seoDesc}
        image={seoImage}
        canonical={canonicalUrl}
        ogType="video.episode"
        jsonLd={watchJsonLd}
      />
      {/* 1. Full-Width Cinema Theater Player */}
      <MirrorBoxPlayer
        animeTitle={title}
        activeEpisode={activeEpisode}
        anilistId={media.id}
        malId={media.idMal}
        hasPrevEpisode={hasPrevEpisode}
        hasNextEpisode={hasNextEpisode}
        onSelectPrev={handleSelectPrev}
        onSelectNext={handleSelectNext}
      />

      {/* 2. Below-the-Fold Context & Queue Grid */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (8 cols): Episode Info & Franchise Context */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <div className="bg-[#181A20] border border-white/[0.08] rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3 sm:pb-4">
              <div>
                <Link
                  to={isMovie ? `/movie/${media.id}` : `/series/${media.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F47521] hover:text-[#FF8533] transition-colors mb-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{title} (Series Details)</span>
                </Link>
                <h1 className="font-display font-extrabold text-lg sm:text-2xl text-white tracking-tight">
                  {isMovie
                    ? title
                    : (activeEpisode.displayTitle
                        ? `S${activeEpisode.seasonNumber || 1} • ${activeEpisode.displayTitle}`
                        : `S${activeEpisode.seasonNumber || 1} E${activeEpisode.episodeNumber} — ${activeEpisode.title}`)}
                </h1>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                <button
                  onClick={handleBookmarkToggle}
                  className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    isBookmarked
                      ? 'border-[#F47521] bg-[#F47521]/15 text-[#F47521]'
                      : 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
                  }`}
                >
                  {isBookmarked ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{isBookmarked ? 'In Watchlist' : 'Watchlist'}</span>
                </button>

                <a
                  href={activeEpisode.mirrorBoxStream?.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-[#2ABDBB] text-black hover:bg-[#2ABDBB]/90 transition-all shadow-sm"
                  title="Direct CDN Download"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isMovie ? 'Download Movie' : 'Download Ep'}</span>
                </a>
              </div>
            </div>

            {/* Quick Metadata */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#8E93A0]">
              <span className="text-white/90 font-medium">{media.format}</span>
              <span>•</span>
              <span className="text-[#FAB818] font-semibold">
                ★ {media.averageScore ? (media.averageScore / 10).toFixed(1) : '8.5'}
              </span>
              <span>•</span>
              <span>{activeEpisode.durationMinutes || 24} minutes</span>
              <span>•</span>
              <span className="text-[#2ABDBB]">Subtitled & English Dubbed</span>
            </div>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-[#D0D0D0] leading-relaxed">
              {media.description
                ? media.description.replace(/<[^>]*>?/gm, '').trim()
                : 'Enjoy high-speed multi-server streaming with full HD resolution and instant download support.'}
            </p>

            {/* Genres */}
            {media.genres && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {media.genres.map((g) => (
                  <Link
                    key={g}
                    to={`/browse?genre=${encodeURIComponent(g)}`}
                    className="text-xs bg-[#121318] text-[#8E93A0] hover:text-white border border-white/5 px-2.5 py-1 rounded-full transition-colors"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Cast strip */}
          {media.characters && media.characters.edges && media.characters.edges.length > 0 && (
            <div className="bg-[#181A20] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <h3 className="font-semibold text-xs text-[#8E93A0] uppercase tracking-wider">
                Featured Characters & Cast
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {media.characters.edges.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-[#121318] border border-white/5">
                    <img
                      src={c.node.image?.medium}
                      alt={c.node.name.full}
                      className="w-8 h-10 object-cover rounded-lg shadow-sm border border-white/5"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/90 truncate">{c.node.name.full}</p>
                      <p className="text-[10px] text-[#8E93A0]">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Up Next / Season Queue Sidebar (Series) OR Movie Details & Download (Movie) */}
        <div className="lg:col-span-4 space-y-4">
          {isMovie ? (
            <div className="bg-[#181A20] border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <Film className="w-4 h-4 text-[#F47521]" />
                <h3 className="font-semibold text-xs text-white/90 uppercase tracking-wider">
                  Movie Features & Download
                </h3>
              </div>

              {/* Direct Download Button */}
              {activeEpisode.mirrorBoxStream?.downloadUrl && (
                <a
                  href={activeEpisode.mirrorBoxStream.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2ABDBB] hover:bg-[#239B99] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD FULL MOVIE</span>
                </a>
              )}

              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#8E93A0]">Format</span>
                  <span className="text-white/90 font-medium">Movie Feature Film</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#8E93A0]">Duration</span>
                  <span className="text-white/90 font-medium">{media.duration || 90} mins</span>
                </div>
                {media.studios?.nodes?.[0]?.name && (
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-[#8E93A0]">Animation Studio</span>
                    <span className="text-white/90 font-medium">{media.studios.nodes[0].name}</span>
                  </div>
                )}
                {media.averageScore && (
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-[#8E93A0]">AniList Rating</span>
                    <span className="text-[#FAB818] font-bold">★ {(media.averageScore / 10).toFixed(1)} / 10</span>
                  </div>
                )}
              </div>

              {/* Related/Recommendations for Movie */}
              {media.recommendations && media.recommendations.nodes && media.recommendations.nodes.length > 0 && (
                <div className="pt-3 border-t border-white/[0.06] space-y-3">
                  <h4 className="font-semibold text-xs text-[#8E93A0] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F47521]" />
                    <span>Recommended Films</span>
                  </h4>
                  <div className="space-y-2">
                    {media.recommendations.nodes.slice(0, 4).map((rec, idx) => {
                      const m = rec.mediaRecommendation;
                      if (!m) return null;
                      return (
                        <Link
                          key={idx}
                          to={m.format === 'MOVIE' ? `/movie/${m.id}` : `/series/${m.id}`}
                          className="flex items-center gap-3 p-2 rounded-xl bg-[#121318] hover:bg-[#20222B] border border-white/5 transition-all group"
                        >
                          <img
                            src={m.coverImage?.large || m.coverImage?.extraLarge}
                            alt={m.title.english || m.title.romaji}
                            className="w-10 h-14 object-cover rounded-lg shadow-sm border border-white/5"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-semibold text-white/90 group-hover:text-[#F47521] transition line-clamp-1">
                              {m.title.english || m.title.romaji}
                            </h5>
                            <p className="text-[10px] text-[#8E93A0] mt-0.5">
                              {m.format} {m.averageScore ? `• ★ ${(m.averageScore / 10).toFixed(1)}` : ''}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#181A20] border border-white/[0.08] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-[#F47521]" />
                  <h3 className="font-semibold text-xs text-white/90 uppercase tracking-wider">
                    Season {activeEpisode.seasonNumber || 1} Queue ({episodes.length} Episodes)
                  </h3>
                </div>
              </div>

              {/* Next Episode Featured Card (if available) */}
              {nextEpisode && (
                <div className="mb-3.5 p-3 rounded-xl bg-[#14151B] border border-[#F47521]/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[#F47521] tracking-wider block">
                    UP NEXT
                  </span>
                  <Link
                    to={`/watch/${media.id}/ep/${nextEpisode.episodeNumber}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="relative w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black">
                      <img
                        src={nextEpisode.thumbnailUrl}
                        alt={nextEpisode.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-semibold text-white/90 group-hover:text-[#F47521] transition line-clamp-1">
                        {nextEpisode.displayTitle || (nextEpisode.title?.toLowerCase().startsWith('episode') ? nextEpisode.title : `Episode ${nextEpisode.episodeNumber}: ${nextEpisode.title}`)}
                      </h5>
                      <span className="text-[10px] text-[#8E93A0]">
                        {nextEpisode.durationMinutes || 24} mins
                      </span>
                    </div>
                  </Link>
                </div>
              )}

              {/* All Episodes in Current Season Scrollable List */}
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1" data-lenis-prevent>
                {episodes.map((ep) => {
                  const isCurrent = ep.episodeNumber === activeEpisode.episodeNumber;
                  return (
                    <Link
                      key={ep.episodeNumber}
                      to={`/watch/${media.id}/ep/${ep.episodeNumber}`}
                      className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-[#F47521]/15 border-[#F47521]/60'
                          : 'bg-[#121318] border-white/5 hover:bg-[#20222B]'
                      }`}
                    >
                      <div className="relative w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black">
                        <img
                          src={ep.thumbnailUrl}
                          alt={ep.title}
                          className="w-full h-full object-cover"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-[#F47521]/80 flex items-center justify-center text-black font-bold text-[10px]">
                            PLAYING
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium line-clamp-1 ${isCurrent ? 'text-[#F47521] font-semibold' : 'text-white/90'}`}>
                          {ep.displayTitle || (ep.title?.toLowerCase().startsWith('episode') ? ep.title : `Episode ${ep.episodeNumber}: ${ep.title}`)}
                        </p>
                        <p className="text-[10px] text-[#8E93A0]">
                          {ep.durationMinutes || 24}m
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
