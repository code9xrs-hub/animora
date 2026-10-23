import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Bookmark,
  Check,
  Download,
  Share2,
  Film,
  Calendar,
  Star,
  Tv,
  Search,
  ArrowUpDown,
  LayoutGrid,
  List,
  X
} from 'lucide-react';
import { fetchAnimeDetail, AnimeDetailResponse, toggleWatchlist, getContinuePlayUrl, detectSeasonNumber } from '../api/animeApi';
import { EpisodeCard } from '../components/cards/EpisodeCard';
import { AnimePosterCard } from '../components/cards/AnimePosterCard';
import { SEO } from '../components/common/SEO';
import { SeriesDetailPageSkeleton } from '../components/common/Shimmer';

export const SeriesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<AnimeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeSeasonId, setActiveSeasonId] = useState<number | null>(null);
  const [isDescOrder, setIsDescOrder] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const [searchEp, setSearchEp] = useState('');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function loadDetail() {
      try {
        setLoading(true);
        const res = await fetchAnimeDetail(id!);
        setData(res);
        setActiveSeasonId(res.media.id);

        // Check bookmark status
        const stored = localStorage.getItem('animora_watchlist') || localStorage.getItem('crunchyroll_watchlist');
        if (stored) {
          const list = JSON.parse(stored);
          setIsBookmarked(list.some((item: any) => item.id === res.media.id));
        }
      } catch (err: any) {
        console.error('Failed to load anime detail:', err);
        setError(err.message || 'Error loading detail');
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return <SeriesDetailPageSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-red-400">{error || 'Anime not found'}</p>
        <Link to="/" className="bg-[#F47521] text-black font-bold px-4 py-2 rounded">
          Back to Home
        </Link>
      </div>
    );
  }

  const { media, episodes, franchiseSeasons } = data;
  const isMovie = media.format === 'MOVIE';
  const title = media.title.english || media.title.romaji || 'Untitled';

  const franchiseIds = (franchiseSeasons || []).map((s) => s.anilistId);
  const continuePlayInfo = getContinuePlayUrl(media, franchiseIds);
  const startWatchingUrl = continuePlayInfo.url;
  const continuePlayLabel = continuePlayInfo.label;
  const lastWatchedItem = continuePlayInfo.lastWatched;

  // Current active season in franchise
  const currentSeasonNode = (franchiseSeasons || []).find((s) => s.anilistId === media.id);
  const currentSeasonMatch = currentSeasonNode?.seasonNumberLabel?.match(/Season\s+(\d+)/i);
  const activeSeasonNumber = currentSeasonMatch
    ? parseInt(currentSeasonMatch[1], 10)
    : (episodes[0]?.seasonNumber || media.seasonNumber || detectSeasonNumber(media) || 1);

  const firstStream = episodes[0]?.mirrorBoxStream;
  const externalId = firstStream?.externalId || media.id;
  const firstDownloadUrl = firstStream?.downloadUrl || (isMovie
    ? `https://mirrorboxapi.web.app/download/movie/${externalId}`
    : `https://mirrorboxapi.web.app/download/tv/${externalId}/${activeSeasonNumber}/1`);

  const handleBookmarkToggle = async () => {
    const added = await toggleWatchlist(media);
    setIsBookmarked(added);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Filter and sort episodes
  let filteredEpisodes = [...episodes];
  if (searchEp.trim()) {
    const query = searchEp.toLowerCase();
    filteredEpisodes = filteredEpisodes.filter(
      (ep) =>
        ep.title.toLowerCase().includes(query) ||
        (ep.displayTitle && ep.displayTitle.toLowerCase().includes(query)) ||
        String(ep.episodeNumber).includes(query)
    );
  }
  if (isDescOrder) {
    filteredEpisodes.reverse();
  }

  const cleanDescription = media.description
    ? media.description.replace(/<[^>]*>?/gm, '').trim()
    : 'No description available.';

  const schema = {
    '@context': 'https://schema.org',
    '@type': isMovie ? 'Movie' : 'TVSeries',
    name: title,
    alternateName: media.title.native || media.title.romaji,
    description: cleanDescription,
    image: media.coverImage?.extraLarge || media.bannerImage,
    genre: media.genres,
    datePublished: media.seasonYear ? String(media.seasonYear) : undefined,
    numberOfEpisodes: media.episodes || undefined,
    aggregateRating: media.averageScore
      ? {
          '@type': 'AggregateRating',
          ratingValue: (media.averageScore / 10).toFixed(1),
          bestRating: '10',
          worstRating: '1',
          ratingCount: media.popularity || 100
        }
      : undefined
  };

  return (
    <div className="w-full pb-20">
      <SEO
        title={`${title} ${isMovie ? '(Movie)' : '(TV Series)'}`}
        description={cleanDescription.slice(0, 180)}
        image={media.bannerImage || media.coverImage?.extraLarge}
        type={isMovie ? 'video.movie' : 'video.tv_show'}
        schema={schema}
      />
      {/* 1. Atmospheric Backdrop Header */}
      <div className="relative w-full min-h-[420px] lg:min-h-[480px] bg-black overflow-hidden flex items-end">
        {/* Background Image with blur & vignette */}
        <div className="absolute inset-0">
          <img
            src={media.bannerImage || media.coverImage?.extraLarge}
            alt={title}
            className="w-full h-full object-cover opacity-35 filter blur-xs brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141519] via-[#141519]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141519] via-[#141519]/70 to-transparent" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
          {/* 2:3 Crisp Poster */}
          <div className="w-36 sm:w-52 md:w-60 flex-shrink-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-[#181A22]">
            <img
              src={media.coverImage?.extraLarge || media.coverImage?.large}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Metadata Info */}
          <div className="flex-1 space-y-3 sm:space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold">
              <span className="bg-[#F47521] text-black px-2.5 py-0.5 rounded-md uppercase tracking-wider font-bold">
                {media.format}
              </span>
              {media.averageScore && (
                <span className="bg-[#FAB818] text-black px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                  {(media.averageScore / 10).toFixed(1)} / 10
                </span>
              )}
              <span className="bg-[#1A1C24]/90 backdrop-blur-md border border-white/10 text-white/90 px-2.5 py-0.5 rounded-md">
                {media.status}
              </span>
              {media.seasonYear && (
                <span className="bg-[#1A1C24]/90 backdrop-blur-md border border-white/10 text-white/90 px-2.5 py-0.5 rounded-md">
                  {media.season} {media.seasonYear}
                </span>
              )}
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-5xl text-white tracking-tight leading-tight">
              {title}
            </h1>

            {media.title.native && (
              <p className="text-xs sm:text-sm text-[#8E93A0] font-normal">
                {media.title.native} • {media.title.romaji}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <button
                onClick={() => navigate(startWatchingUrl)}
                className="bg-[#F47521] hover:bg-[#FF8533] text-black font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#F47521]/20 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
                <span>{continuePlayLabel}</span>
              </button>

              <button
                onClick={handleBookmarkToggle}
                className={`px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition-all ${
                  isBookmarked
                    ? 'border-[#F47521] bg-[#F47521]/15 text-[#F47521]'
                    : 'border-white/20 bg-black/40 backdrop-blur-sm text-white hover:bg-white/10'
                }`}
              >
                {isBookmarked ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{isBookmarked ? 'IN WATCHLIST' : 'WATCHLIST'}</span>
              </button>

              {isMovie && (
                <a
                  href={firstDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-[#2ABDBB]/40 bg-[#2ABDBB]/15 text-[#2ABDBB] hover:bg-[#2ABDBB] hover:text-black transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD</span>
                </a>
              )}

              {media.trailer && media.trailer.id && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/20 bg-black/40 backdrop-blur-sm text-white hover:bg-white/10 transition-all"
                >
                  <Film className="w-4 h-4 text-[#FAB818]" />
                  <span>TRAILER</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="p-2.5 sm:p-3 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm text-[#8E93A0] hover:text-white hover:bg-white/10 transition-all relative"
                title="Share link"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                {isCopied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded-md shadow whitespace-nowrap border border-white/20">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (8 cols): Synopsis, Season Selector & Episode Grid */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Synopsis & Tags */}
          <div className="bg-[#181A20] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-3 sm:space-y-4 shadow-sm">
            <h3 className="font-semibold text-white uppercase tracking-wider text-xs text-[#8E93A0]">
              Synopsis
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-[#D0D0D0]">
              {cleanDescription}
            </p>

            {/* Clickable Genre Pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-3 border-t border-white/[0.06]">
              <span className="text-xs text-[#8E93A0] font-medium mr-1">Genres:</span>
              {media.genres.map((genre) => (
                <Link
                  key={genre}
                  to={`/browse?genre=${encodeURIComponent(genre)}`}
                  className="text-xs bg-[#121318] text-[#8E93A0] hover:text-white hover:border-[#F47521]/60 border border-white/10 px-3 py-1 rounded-full transition-all"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>

          {/* Franchise Season Selector & Episode Browser (Only for Series, NOT for Movies) */}
          {!isMovie && (
            <div className="space-y-4">
              {/* Season Selector Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-[#F47521]" />
                  <h3 className="font-display font-bold text-base sm:text-xl text-white">
                    Episodes & Seasons
                  </h3>

                  {/* Season Dropdown if multiple franchise entries exist */}
                  {franchiseSeasons.length > 1 ? (
                    <select
                      value={activeSeasonId || media.id}
                      onChange={(e) => {
                        const selId = Number(e.target.value);
                        if (selId !== media.id) {
                          navigate(media.format === 'MOVIE' ? `/movie/${selId}` : `/series/${selId}`);
                        }
                      }}
                      className="bg-[#181A22] border border-[#F47521]/80 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer hover:border-[#F47521] shadow-sm transition-colors"
                    >
                      {franchiseSeasons.map((s) => (
                        <option key={s.anilistId} value={s.anilistId}>
                          {s.seasonNumberLabel} • {s.title} ({s.episodesCount} {s.episodesCount === 1 ? 'ep' : 'eps'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs bg-[#181A22] border border-white/10 text-[#8E93A0] font-medium px-3 py-1.5 rounded-xl">
                      {currentSeasonNode?.seasonNumberLabel || `Season ${activeSeasonNumber}`} • {episodes.length} Episodes
                    </span>
                  )}
                </div>

                {/* Episode Filter & Sort Toolbar */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search in episodes */}
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Find episode..."
                      value={searchEp}
                      onChange={(e) => setSearchEp(e.target.value)}
                      className="w-full sm:w-44 md:w-52 bg-[#181A22] text-xs text-white pl-8 pr-3 py-2 rounded-xl border border-white/10 focus:border-[#F47521] focus:outline-none transition-colors"
                    />
                    <Search className="w-3.5 h-3.5 text-[#8E93A0] absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>

                  {/* Asc / Desc Sort */}
                  <button
                    onClick={() => setIsDescOrder(!isDescOrder)}
                    className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all flex-shrink-0 ${
                      isDescOrder
                        ? 'border-[#F47521] text-[#F47521] bg-[#F47521]/10'
                        : 'border-white/10 text-[#8E93A0] hover:text-white bg-[#181A22]'
                    }`}
                    title={isDescOrder ? 'Descending (Newest first)' : 'Ascending (1 → N)'}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isDescOrder ? 'Desc' : 'Asc'}</span>
                  </button>

                  {/* Grid / List View Toggle */}
                  <button
                    onClick={() => setIsListView(!isListView)}
                    className="p-2 rounded-xl border border-white/10 bg-[#181A22] text-[#8E93A0] hover:text-white transition-all flex-shrink-0"
                    title={isListView ? 'Switch to Grid View' : 'Switch to List View'}
                  >
                    {isListView ? <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                </div>
              </div>

              {/* Episode Grid / List */}
              {filteredEpisodes.length === 0 ? (
                <div className="p-8 text-center bg-[#181A20] rounded-2xl border border-white/[0.08] text-[#8E93A0] text-xs">
                  No episodes matched your filter.
                </div>
              ) : isListView ? (
                <div className="space-y-2">
                  {filteredEpisodes.map((ep) => (
                    <div
                      key={ep.episodeNumber}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#181A20] hover:bg-[#20222B] border border-white/[0.08] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/watch/${media.id}/ep/${ep.episodeNumber}`}
                          className="w-8 h-8 rounded-full bg-[#121318] flex items-center justify-center text-[#F47521] hover:bg-[#F47521] hover:text-black transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </Link>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/watch/${media.id}/ep/${ep.episodeNumber}`}
                              className="text-xs sm:text-sm font-semibold text-white/90 hover:text-[#F47521] transition line-clamp-1"
                            >
                              {ep.displayTitle || (ep.title?.toLowerCase().startsWith('episode') ? ep.title : `Episode ${ep.episodeNumber}: ${ep.title}`)}
                            </Link>
                            {lastWatchedItem?.anilistId === media.id && lastWatchedItem?.episodeNumber === ep.episodeNumber && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F47521]/20 text-[#F47521] border border-[#F47521]/30">
                                Last Played
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#8E93A0]">
                            {ep.durationMinutes || 24} mins
                          </span>
                        </div>
                      </div>
                      <a
                        href={ep.mirrorBoxStream?.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-[#2ABDBB]/10 text-[#2ABDBB] text-xs font-medium hover:bg-[#2ABDBB] hover:text-black transition-all flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                  {filteredEpisodes.map((ep) => (
                    <EpisodeCard
                      key={ep.episodeNumber}
                      anilistId={media.id}
                      episode={ep}
                      seasonNumber={ep.seasonNumber || activeSeasonNumber}
                      isActive={lastWatchedItem?.anilistId === media.id && lastWatchedItem?.episodeNumber === ep.episodeNumber}
                      isWatched={lastWatchedItem?.anilistId === media.id ? ep.episodeNumber <= lastWatchedItem.episodeNumber : false}
                      progressPercent={lastWatchedItem?.anilistId === media.id && ep.episodeNumber === lastWatchedItem.episodeNumber ? 75 : 0}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Character & Voice Actor Strip */}
          {media.characters && media.characters.edges && media.characters.edges.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/[0.08]">
              <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                Characters & Voice Actors
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {media.characters.edges.slice(0, 6).map((edge, idx) => {
                  const charName = edge.node.name.full;
                  const va = edge.voiceActors?.[0];
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#181A20] border border-white/[0.08]"
                    >
                      <img
                        src={edge.node.image?.medium}
                        alt={charName}
                        className="w-10 h-12 object-cover rounded-lg shadow-sm border border-white/5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/90 truncate">{charName}</p>
                        <p className="text-[10px] text-[#8E93A0] uppercase font-medium">{edge.role}</p>
                        {va && (
                          <p className="text-[10px] text-[#2ABDBB] truncate font-medium">VA: {va.name.full}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Metadata Details Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#181A20] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[#8E93A0] border-b border-white/[0.06] pb-2.5">
              Anime Details
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-[#8E93A0]">Studio:</span>
                <span className="text-white/90 font-medium">
                  {media.studios?.nodes?.[0]?.name || 'Unknown'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-[#8E93A0]">Format:</span>
                <span className="text-white/90 font-medium">{media.format}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-[#8E93A0]">Status:</span>
                <span className="text-white/90 font-medium">{media.status}</span>
              </div>

              {!isMovie && (
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#8E93A0]">Episodes:</span>
                  <span className="text-white/90 font-medium">{media.episodes || 'Ongoing'}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-[#8E93A0]">{isMovie ? 'Duration:' : 'Episode Duration:'}</span>
                <span className="text-white/90 font-medium">{media.duration || (isMovie ? 90 : 24)} mins</span>
              </div>

              {!isMovie && (
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#8E93A0]">Season:</span>
                  <span className="text-white/90 font-medium">
                    {media.season || 'N/A'} {media.seasonYear || ''}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-[#8E93A0]">Source:</span>
                <span className="text-white/90 font-medium">{media.source || 'Original'}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-[#8E93A0]">AniList Score:</span>
                <span className="text-[#FAB818] font-bold">
                  ★ {media.averageScore ? `${(media.averageScore / 10).toFixed(1)} / 10` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations Rail */}
          {media.recommendations && media.recommendations.nodes && media.recommendations.nodes.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-[#8E93A0] uppercase tracking-wider">
                You May Also Like
              </h4>
              <div className="space-y-2">
                {media.recommendations.nodes.slice(0, 4).map((rec, idx) => {
                  const m = rec.mediaRecommendation;
                  if (!m) return null;
                  return (
                    <Link
                      key={idx}
                      to={m.format === 'MOVIE' ? `/movie/${m.id}` : `/series/${m.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#181A20] hover:bg-[#20222B] border border-white/[0.08] transition-all group"
                    >
                      <img
                        src={m.coverImage?.large || m.coverImage?.extraLarge}
                        alt={m.title.english || m.title.romaji}
                        className="w-12 h-16 object-cover rounded-lg shadow-sm border border-white/5"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-semibold text-white/90 group-hover:text-[#F47521] transition line-clamp-1">
                          {m.title.english || m.title.romaji}
                        </h5>
                        <p className="text-[11px] text-[#8E93A0] mt-0.5">
                          {m.format} • {m.episodes ? `${m.episodes} Eps` : 'Movie'}
                        </p>
                        {m.averageScore && (
                          <span className="text-[10px] text-[#FAB818] font-semibold">
                            ★ {(m.averageScore / 10).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. YouTube Trailer Modal */}
      {isTrailerOpen && media.trailer && media.trailer.id && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsTrailerOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsTrailerOpen(false)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-[#F47521] text-white hover:text-black flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${media.trailer.id}?autoplay=1`}
              title="Anime Trailer"
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};
