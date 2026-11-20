import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getAnimeUrl, getWatchUrl, parseSeriesSlug, getCachedSlugId } from '../lib/slug';
import { getHighResPoster, getHighResEpisodeThumbnail } from '../lib/imageUtils';
import {
  fetchAnimeDetail,
  AnimeDetailResponse,
  recordHistory,
  toggleWatchlist,
  getLastWatched
} from '../api/animeApi';
import { useIsInWatchlist } from '../lib/userStore';
import { EpisodeItemDTO } from '../types/anime';
import { MirrorBoxPlayer } from '../components/player/MirrorBoxPlayer';
import { Play, Bookmark, Check, Download, ArrowLeft, Tv, Film, Sparkles } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { WatchPageSkeleton } from '../components/common/Shimmer';
import { StatusMessage } from '../components/common/StatusMessage';

export const WatchPage: React.FC = () => {
  const { slug, id: routeId, episodeNumber, year } = useParams<{
    slug?: string;
    id?: string;
    episodeNumber?: string;
    year?: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState<AnimeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rawParam = slug || routeId || '';
  const isMovieRoute = location.pathname.startsWith('/movie') || (year !== undefined);

  // Parse episode number and season from URL (handles both /watch/solo-leveling-1x2 and /watch/186541/ep/2)
  const parsedUrlInfo = useMemo(() => {
    if (episodeNumber) {
      return { episode: parseInt(episodeNumber, 10) || 1, season: 1 };
    }
    if (slug) {
      const parsed = parseSeriesSlug(slug);
      return { episode: parsed.episode, season: parsed.season };
    }
    return { episode: 1, season: 1 };
  }, [episodeNumber, slug]);

  const [selectedEpNum, setSelectedEpNum] = useState<number>(parsedUrlInfo.episode);
  const activeEpisodeRef = useRef<HTMLButtonElement | null>(null);

  // Sync selected episode with URL parameter when browser back/forward is used
  useEffect(() => {
    if (parsedUrlInfo.episode && parsedUrlInfo.episode !== selectedEpNum) {
      setSelectedEpNum(parsedUrlInfo.episode);
    }
  }, [parsedUrlInfo.episode, selectedEpNum]);

  // Auto-scroll the episode list to the active episode
  useEffect(() => {
    if (activeEpisodeRef.current) {
      activeEpisodeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedEpNum, loading]);

  // Reactive watchlist subscription
  const isBookmarked = useIsInWatchlist(data?.media?.id);

  // 1. Fetch Anime Detail
  const loadDetail = useCallback(async () => {
    if (!rawParam) return;
    try {
      setLoading(true);
      setError(null);

      const locationState = location.state as { anilistId?: number } | null;
      let targetId: number | string = rawParam;

      if (locationState?.anilistId) {
        targetId = locationState.anilistId;
      } else if (getCachedSlugId(rawParam)) {
        targetId = getCachedSlugId(rawParam)!;
      } else if (/^\d+$/.test(rawParam)) {
        targetId = Number(rawParam);
      }

      const res = await fetchAnimeDetail(targetId, {
        format: isMovieRoute ? 'MOVIE' : undefined,
        seasonYear: year ? Number(year) : undefined
      });

      const isMovie = res.media.format === 'MOVIE';

      // Auto-resume: if user accessed without specifying episode, play last played season & episode
      if (!episodeNumber && !slug?.includes('x') && !isMovie) {
        const franchiseIds = (res.franchiseSeasons || []).map((s: { anilistId: number }) => s.anilistId);
        const last = getLastWatched(res.media.id, franchiseIds);
        if (last) {
          setSelectedEpNum(last.episodeNumber);
          const lastWatchUrl = getWatchUrl(res.media, last.seasonNumber || 1, last.episodeNumber);
          navigate(lastWatchUrl, { replace: true, state: { anilistId: res.media.id } });
          setData(res);
          setLoading(false);
          return;
        }
      }

      // Auto-normalize and upgrade URL to ensure exact canonical schema:
      // Series: /watch/:title-:seasonx:episode
      // Movie: /watch/:title/:year
      const targetSeason = parsedUrlInfo.season || 1;
      const targetEp = parsedUrlInfo.episode || 1;
      const canonicalUrl = getWatchUrl(res.media, targetSeason, targetEp);

      if (location.pathname !== canonicalUrl) {
        navigate(canonicalUrl, { replace: true, state: { anilistId: res.media.id } });
      }

      setData(res);
    } catch (err: unknown) {
      console.error('Failed to load anime stream:', err);
      setError(err instanceof Error ? err.message : 'Error loading playback');
    } finally {
      setLoading(false);
    }
  }, [rawParam, episodeNumber, slug, isMovieRoute, year, location.state, navigate, parsedUrlInfo]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // 2. Record watch history in background whenever episode changes (zero UI interruption)
  useEffect(() => {
    if (!data?.media) return;
    const effectiveSeason =
      data.episodes?.find((ep) => ep.episodeNumber === selectedEpNum)?.seasonNumber ||
      data.episodes?.[0]?.mirrorBoxStream?.resolvedSeason ||
      1;
    recordHistory(data.media.id, selectedEpNum, 120, 1440, data.media, effectiveSeason);
  }, [data, selectedEpNum]);

  if (loading) {
    return <WatchPageSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <StatusMessage
          title="Playback Error"
          description={error || 'Unable to load anime playback details.'}
          onRetry={loadDetail}
          link={{ to: '/', label: 'Back to Home' }}
        />
      </div>
    );
  }

  const { media, episodes, franchiseSeasons } = data;
  const isMovie = media.format === 'MOVIE';
  const title = media.title.english || media.title.romaji || 'Untitled';

  // Find active episode item
  const activeEpisodeIndex = episodes.findIndex((ep) => ep.episodeNumber === selectedEpNum);
  const fallbackStream = episodes[0]?.mirrorBoxStream;
  const fallbackExternalId = fallbackStream?.externalId || String(media.id);
  const fallbackSeason = fallbackStream?.resolvedSeason || 1;

  const activeEpisode: EpisodeItemDTO = activeEpisodeIndex >= 0
    ? episodes[activeEpisodeIndex]
    : episodes[0] || {
        episodeNumber: selectedEpNum,
        title: isMovie ? title : `Episode ${selectedEpNum}`,
        thumbnailUrl: media.bannerImage || getHighResPoster(media),
        durationMinutes: 24,
        isAired: true,
        airingAtUnix: null,
        mirrorBoxStream: {
          provider: 'mirrorbox',
          mediaType: isMovie ? 'movie' : 'tv',
          externalId: fallbackExternalId,
          resolvedSeason: fallbackSeason,
          resolvedEpisode: isMovie ? 1 : selectedEpNum,
          embedUrl: isMovie
            ? `https://mirrorboxapi.web.app/movie/${fallbackExternalId}`
            : `https://mirrorboxapi.web.app/tv/${fallbackExternalId}/${fallbackSeason}/${selectedEpNum}`,
          downloadUrl: isMovie
            ? `https://mirrorboxapi.web.app/download/movie/${fallbackExternalId}`
            : `https://mirrorboxapi.web.app/download/tv/${fallbackExternalId}/${fallbackSeason}/${selectedEpNum}`,
          availableServers: fallbackStream?.availableServers || ['Abyss', 'FileMoon', 'Vidmoly', 'Streamwish']
        }
      };

  const hasPrevEpisode = activeEpisodeIndex > 0;
  const hasNextEpisode = activeEpisodeIndex >= 0 && activeEpisodeIndex < episodes.length - 1;
  const nextEpisode = hasNextEpisode ? episodes[activeEpisodeIndex + 1] : null;

  // Determine next season if at end of current season
  const currentFranchiseIndex = franchiseSeasons?.findIndex((s) => s.anilistId === media.id) ?? -1;
  const nextSeasonNode = currentFranchiseIndex >= 0 && franchiseSeasons && currentFranchiseIndex < franchiseSeasons.length - 1
    ? franchiseSeasons[currentFranchiseIndex + 1]
    : null;

  // Seamless in-place episode switching (Zero page reload / Zero skeleton flash)
  const handleEpisodeChange = (newEpNum: number) => {
    if (newEpNum === selectedEpNum || !data) return;
    setSelectedEpNum(newEpNum);
    const activeSeason = activeEpisode.seasonNumber || episodes[0]?.seasonNumber || 1;
    const nextWatchUrl = getWatchUrl(data.media, activeSeason, newEpNum);
    navigate(nextWatchUrl, { replace: true, state: { anilistId: data.media.id } });
  };

  const handleSelectPrev = () => {
    if (hasPrevEpisode) {
      handleEpisodeChange(episodes[activeEpisodeIndex - 1].episodeNumber);
    }
  };

  const handleSelectNext = () => {
    if (hasNextEpisode) {
      handleEpisodeChange(episodes[activeEpisodeIndex + 1].episodeNumber);
    }
  };

  const handleBookmarkToggle = () => {
    toggleWatchlist(media);
  };

  const seoTitle = isMovie
    ? `Watch ${title} Full Movie Online Free in HD`
    : `Watch ${title} Episode ${selectedEpNum} Sub & Dub in HD`;
  const seoDesc = `Stream ${title} ${isMovie ? 'movie' : `Episode ${selectedEpNum}`} in 1080p Full HD on Animora. High-speed multi-server streaming with subtitle and audio options.`;
  const seoImage = getHighResEpisodeThumbnail(activeEpisode.thumbnailUrl, media.bannerImage, getHighResPoster(media));
  const siteDomain = 'https://animora.web.app';
  const activeSeasonNum = activeEpisode.seasonNumber || episodes[0]?.seasonNumber || 1;
  const canonicalPath = getWatchUrl(media, activeSeasonNum, selectedEpNum);
  const fullCanonicalUrl = `${siteDomain}${canonicalPath}`;

  const watchJsonLd = isMovie
    ? {
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: title,
        description: media.description?.replace(/<[^>]+>/g, '').slice(0, 200) || seoDesc,
        image: seoImage,
        genre: media.genres || [],
        url: fullCanonicalUrl
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'TVEpisode',
        name: activeEpisode.title || `Episode ${selectedEpNum}`,
        episodeNumber: selectedEpNum,
        partOfSeries: {
          '@type': 'TVSeries',
          name: title,
          url: `${siteDomain}${getAnimeUrl(media, activeSeasonNum)}`
        },
        image: seoImage,
        description: media.description?.replace(/<[^>]+>/g, '').slice(0, 200) || seoDesc,
        url: fullCanonicalUrl
      };

  return (
    <div className="w-full pb-20">
      <SEO
        title={seoTitle}
        description={seoDesc}
        image={seoImage}
        canonical={fullCanonicalUrl}
        ogType="video.episode"
        jsonLd={watchJsonLd}
      />

      <div className="max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-5 space-y-5 sm:space-y-6">
        {/* Desktop View: Player on Left, Episode Queue Sidebar on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Main Video Player Container (Desktop 8 or 9 cols, Full on mobile) */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col">
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

            {/* Below-Player Anime Info Box */}
            <div className="mt-4 bg-[#181A20] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3 sm:pb-3.5">
                <div>
                  <Link
                    to={getAnimeUrl(media, activeSeasonNum)}
                    state={{ anilistId: media.id }}
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
                    type="button"
                    onClick={handleBookmarkToggle}
                    className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isBookmarked
                        ? 'border-[#F47521] bg-[#F47521]/15 text-[#F47521]'
                        : 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
                    }`}
                  >
                    {isBookmarked ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    <span>{isBookmarked ? 'In Watchlist' : 'Watchlist'}</span>
                  </button>
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

              {/* Featured Characters & Cast (Horizontal Left-to-Right Scroll with Round Shape) */}
              {media.characters && media.characters.edges && media.characters.edges.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  <h3 className="font-semibold text-xs text-[#8E93A0] uppercase tracking-wider">
                    Featured Characters & Cast
                  </h3>
                  <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1" data-lenis-prevent>
                    {media.characters.edges.map((c, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center flex-shrink-0 text-center w-16 sm:w-20 group"
                      >
                        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#F47521] transition-all shadow-md bg-black/60 flex-shrink-0">
                          <img
                            src={c.node.image?.large || c.node.image?.medium}
                            alt={c.node.name.full}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-[11px] font-semibold text-white/90 truncate w-full mt-1.5 group-hover:text-[#F47521] transition-colors" title={c.node.name.full}>
                          {c.node.name.full}
                        </p>
                        <p className="text-[9.5px] text-[#8E93A0] truncate w-full leading-tight font-medium" title={c.role}>
                          {c.role}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Genres */}
              {media.genres && (
                <div className="flex flex-wrap gap-1.5 pt-1">
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
          </div>

          {/* Right Column: Episode Queue List (Side by Side with Player on Desktop) */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-4">
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
                    className="w-full py-2.5 px-4 rounded-xl bg-[#2ABDBB] hover:bg-[#239B99] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
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
                            to={getAnimeUrl(m)}
                            state={{ anilistId: m.id }}
                            className="flex items-center gap-3 p-2 rounded-xl bg-[#121318] hover:bg-[#20222B] border border-white/5 transition-all group"
                          >
                            <img
                              src={getHighResPoster(m)}
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
              <div className="bg-[#181A20] border border-white/[0.08] rounded-2xl p-4 shadow-sm flex flex-col h-full lg:max-h-[640px] xl:max-h-[690px]">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Tv className="w-4 h-4 text-[#F47521] flex-shrink-0" />
                    {franchiseSeasons && franchiseSeasons.length > 1 ? (
                      <select
                        value={media.id}
                        onChange={(e) => {
                          const targetId = Number(e.target.value);
                          if (targetId !== media.id) {
                            const selSeason = franchiseSeasons.find((s) => s.anilistId === targetId);
                            const sMatch = selSeason?.seasonNumberLabel?.match(/Season\s+(\d+)/i);
                            const sNum = sMatch ? parseInt(sMatch[1], 10) : 1;
                            const targetUrl = getWatchUrl({ id: targetId, title: selSeason?.title || title, format: media.format }, sNum, 1);
                            navigate(targetUrl, { state: { anilistId: targetId } });
                          }
                        }}
                        className="bg-[#101116] border border-[#F47521]/60 text-white text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer hover:border-[#F47521] transition-colors"
                        title="Switch Season"
                      >
                        {franchiseSeasons.map((s) => {
                          const seasonLabel = s.seasonNumberLabel || 'Season 1';
                          const epSuffix = s.episodesCount ? ` (EP${s.episodesCount})` : '';
                          return (
                            <option key={s.anilistId} value={s.anilistId}>
                              {seasonLabel}{epSuffix}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <h3 className="font-semibold text-xs text-white/90 uppercase tracking-wider truncate">
                        Season {activeEpisode.seasonNumber || 1} Queue ({episodes.length} Episodes)
                      </h3>
                    )}
                  </div>
                </div>

                {/* Next Episode Featured Card (if available in current season) */}
                {nextEpisode && (
                  <div className="mb-3 p-2.5 rounded-xl bg-[#14151B] border border-[#F47521]/30 space-y-1.5 flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase text-[#F47521] tracking-wider block">
                      UP NEXT
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEpisodeChange(nextEpisode.episodeNumber)}
                      className="flex items-center gap-2.5 group w-full text-left cursor-pointer"
                    >
                      <div className="relative w-16 aspect-video rounded-md overflow-hidden flex-shrink-0 bg-black">
                        <img
                          src={getHighResEpisodeThumbnail(nextEpisode.thumbnailUrl, media.bannerImage, getHighResPoster(media))}
                          alt={nextEpisode.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play className="w-3.5 h-3.5 text-white fill-current" />
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
                    </button>
                  </div>
                )}

                {/* If at end of season and next season exists */}
                {!nextEpisode && nextSeasonNode && (
                  <div className="mb-3 p-2.5 rounded-xl bg-[#14151B] border border-[#2ABDBB]/40 space-y-1.5 flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase text-[#2ABDBB] tracking-wider block">
                      UP NEXT (NEXT SEASON)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const sMatch = nextSeasonNode.seasonNumberLabel?.match(/Season\s+(\d+)/i);
                        const sNum = sMatch ? parseInt(sMatch[1], 10) : 2;
                        const nextSeasonUrl = getWatchUrl({ id: nextSeasonNode.anilistId, title: nextSeasonNode.title || title, format: media.format }, sNum, 1);
                        navigate(nextSeasonUrl, { state: { anilistId: nextSeasonNode.anilistId } });
                      }}
                      className="flex items-center gap-2.5 group w-full text-left cursor-pointer"
                    >
                      <div className="w-12 h-10 rounded-md bg-[#2ABDBB]/15 border border-[#2ABDBB]/30 flex items-center justify-center text-[#2ABDBB] flex-shrink-0">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-semibold text-white/90 group-hover:text-[#2ABDBB] transition line-clamp-1">
                          {nextSeasonNode.seasonNumberLabel || 'Next Season'} — Episode 1
                        </h5>
                        <span className="text-[10px] text-[#8E93A0]">
                          Start next season now
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* All Episodes in Current Season Scrollable List */}
                <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-[300px]" data-lenis-prevent>
                  {episodes.map((ep) => {
                    const isCurrent = ep.episodeNumber === activeEpisode.episodeNumber;
                    return (
                      <button
                        ref={isCurrent ? activeEpisodeRef : null}
                        type="button"
                        key={ep.episodeNumber}
                        onClick={() => handleEpisodeChange(ep.episodeNumber)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all w-full text-left cursor-pointer ${
                          isCurrent
                            ? 'bg-[#F47521]/15 border-[#F47521]/60'
                            : 'bg-[#121318] border-white/5 hover:bg-[#20222B]'
                        }`}
                      >
                        <div className="relative w-16 aspect-video rounded-md overflow-hidden flex-shrink-0 bg-black">
                          <img
                            src={getHighResEpisodeThumbnail(ep.thumbnailUrl, media.bannerImage, getHighResPoster(media))}
                            alt={ep.title}
                            className="w-full h-full object-cover"
                          />
                          {isCurrent && (
                            <div className="absolute inset-0 bg-[#F47521]/80 flex items-center justify-center text-black font-bold text-[9px]">
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
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
