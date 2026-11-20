import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Download,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Minimize2,
  Server,
  Volume2,
  Captions,
  Maximize
} from 'lucide-react';
import { EpisodeItemDTO } from '../../types/anime';
import { resolveCrosswalkStream } from '../../api/crosswalkResolver';

export type VideoServer = 'mirrorbox' | 'sub' | 'dub';

interface MirrorBoxPlayerProps {
  animeTitle: string;
  activeEpisode: EpisodeItemDTO;
  anilistId?: number | string;
  malId?: number | null;
  hasPrevEpisode: boolean;
  hasNextEpisode: boolean;
  onSelectPrev: () => void;
  onSelectNext: () => void;
}

export const MirrorBoxPlayer: React.FC<MirrorBoxPlayerProps> = ({
  animeTitle,
  activeEpisode,
  anilistId,
  malId,
  hasPrevEpisode,
  hasNextEpisode,
  onSelectPrev,
  onSelectNext,
}) => {
  const [lightsOff, setLightsOff] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [activeServer, setActiveServer] = useState<VideoServer>('mirrorbox');
  const [liveStream, setLiveStream] = useState(activeEpisode.mirrorBoxStream);
  const [isRotatedLandscape, setIsRotatedLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);

  const initialStream = activeEpisode.mirrorBoxStream;
  const isMovie = initialStream?.mediaType === 'movie';

  // Listen to fullscreen events to keep state & orientation in sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isFs);
      if (!isFs && window.screen?.orientation?.unlock) {
        try {
          window.screen.orientation.unlock();
        } catch {}
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Toggle rotation / fullscreen handler
  const handleToggleRotate = useCallback(async () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        }

        // Request landscape orientation lock if supported
        if (window.screen?.orientation && 'lock' in window.screen.orientation) {
          await (window.screen.orientation as any).lock('landscape').catch(() => {});
        }
      } catch {
        // Fallback to manual CSS 90-degree landscape rotation if native fullscreen/orientation lock is denied
        setIsRotatedLandscape((prev) => !prev);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
      if (window.screen?.orientation?.unlock) {
        try {
          window.screen.orientation.unlock();
        } catch {}
      }
      setIsRotatedLandscape(false);
    }
  }, []);

  // Keyboard navigation shortcuts (f: fullscreen, l: lights off, p: prev, n: next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleRotate();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setLightsOff((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        if (hasNextEpisode) {
          e.preventDefault();
          onSelectNext();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        if (hasPrevEpisode) {
          e.preventDefault();
          onSelectPrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasNextEpisode, hasPrevEpisode, onSelectNext, onSelectPrev]);

  // Real-time conversion safeguard: if active stream is unmapped, resolve on the fly
  useEffect(() => {
    let isMounted = true;
    if (activeEpisode.mirrorBoxStream?.isMapped) {
      setLiveStream(activeEpisode.mirrorBoxStream);
    } else if (anilistId) {
      resolveCrosswalkStream(
        Number(anilistId),
        activeEpisode.episodeNumber || 1,
        isMovie ? 'MOVIE' : 'TV',
        malId
      ).then((res) => {
        if (isMounted && res) {
          setLiveStream(res);
        }
      }).catch((e) => console.warn('Realtime player stream resolution notice:', e));
    }
    return () => {
      isMounted = false;
    };
  }, [activeEpisode.episodeNumber, anilistId, malId, activeEpisode.mirrorBoxStream, isMovie]);

  const stream = liveStream || activeEpisode.mirrorBoxStream;
  const epNum = isMovie ? 1 : (activeEpisode.episodeNumber || 1);
  const seasonNum = activeEpisode.seasonNumber || activeEpisode.mirrorBoxStream?.resolvedSeason || 1;
  const externalId = stream?.externalId || (anilistId ? String(anilistId) : String(epNum));

  // Compute active embed URL based on chosen server and season
  let embedUrl = stream?.embedUrl || (isMovie
    ? `https://mirrorboxapi.web.app/movie/${externalId}`
    : `https://mirrorboxapi.web.app/tv/${externalId}/${seasonNum}/${epNum}`);

  if (activeServer === 'sub') {
    embedUrl = anilistId
      ? `https://megaplay.buzz/stream/ani/${anilistId}/${epNum}/sub`
      : (malId ? `https://megaplay.buzz/stream/mal/${malId}/${epNum}/sub` : embedUrl);
  } else if (activeServer === 'dub') {
    embedUrl = anilistId
      ? `https://megaplay.buzz/stream/ani/${anilistId}/${epNum}/dub`
      : (malId ? `https://megaplay.buzz/stream/mal/${malId}/${epNum}/dub` : embedUrl);
  }

  const downloadUrl = stream?.downloadUrl || (isMovie
    ? `https://mirrorboxapi.web.app/download/movie/${externalId}`
    : `https://mirrorboxapi.web.app/download/tv/${externalId}/${seasonNum}/${epNum}`);

  // Reset loading state on episode or server change
  useEffect(() => {
    setIframeLoaded(false);
  }, [activeServer, activeEpisode.episodeNumber, embedUrl]);

  return (
    <section className="relative w-full">
      {/* Lights-Off Backdrop Overlay */}
      {lightsOff && (
        <div
          onClick={() => setLightsOff(false)}
          className="fixed inset-0 z-30 bg-black/92 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
          title="Click to turn lights back on"
        />
      )}

      <div
        className="relative z-40 mx-auto w-full"
      >
        {/* 16:9 Responsive Iframe Container with Full Rotation Support */}
        <div
          ref={playerContainerRef}
          className={`relative aspect-video w-full overflow-hidden bg-[#141519] shadow-2xl ring-1 ring-white/10 ${
            isRotatedLandscape
              ? 'fixed top-0 left-[100vw] w-[100vh] h-[100vw] rotate-90 origin-top-left z-[99999] rounded-none !aspect-auto'
              : isFullscreen
                ? 'w-full h-full rounded-none !aspect-auto'
                : 'rounded-xl'
          }`}
        >
          {/* Exit Full Screen Floating Badge */}
          {(isRotatedLandscape || isFullscreen) && (
            <button
              type="button"
              onClick={handleToggleRotate}
              className="absolute top-4 right-4 z-50 bg-black/85 hover:bg-[#F47521] text-white hover:text-black px-3.5 py-1.5 rounded-full shadow-2xl transition-all flex items-center gap-1.5 text-xs font-bold border border-white/20 backdrop-blur-md cursor-pointer active:scale-95"
              title="Exit Fullscreen"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Fullscreen</span>
            </button>
          )}

          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 bg-[#0E1015] animate-shimmer text-white z-10 px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#1A1C24] border border-[#F47521]/40 flex items-center justify-center shadow-lg shadow-[#F47521]/15 animate-pulse">
                <Play className="w-6 h-6 text-[#F47521] fill-current ml-0.5" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <p className="text-xs sm:text-sm font-semibold text-white/90">
                  Connecting to{' '}
                  <span className="text-[#F47521]">
                    {activeServer === 'mirrorbox'
                      ? 'Mirror-Box Multi-Server CDN'
                      : activeServer === 'sub'
                        ? 'Megaplay SUB Server'
                        : 'Megaplay DUB Server'}
                  </span>
                </p>
                <p className="text-[11px] text-[#7A7F8E]">
                  Buffering {animeTitle} {!isMovie && `• Season ${seasonNum} • Episode ${activeEpisode.episodeNumber}`}
                </p>
              </div>
            </div>
          )}

          <iframe
            key={embedUrl}
            src={embedUrl}
            title={`${animeTitle} - ${activeEpisode.title} (${activeServer})`}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; screen-wake-lock; orientation-lock; web-share"
            {...{ autoPictureInPicture: "true" }}
            referrerPolicy="origin"
            onLoad={() => setIframeLoaded(true)}
            style={{
              aspectRatio: isRotatedLandscape ? 'auto' : '16/9',
              border: 'none',
              borderRadius: isFullscreen || isRotatedLandscape ? '0px' : '12px',
              background: '#000',
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Sleek, Perfectly Aligned Player Action Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-[#16181F] px-3 sm:px-4 py-2 border border-white/[0.08] shadow-sm">
          {/* Left Controls: Lights & Fullscreen */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setLightsOff((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#8E93A0] hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
              title={lightsOff ? 'Turn lights on' : 'Dim lights around player'}
            >
              {lightsOff ? <Sun className="w-3.5 h-3.5 text-[#FAB818]" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{lightsOff ? 'Lights On' : 'Lights Off'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleRotate}
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#8E93A0] hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
              title={isFullscreen || isRotatedLandscape ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullscreen || isRotatedLandscape ? (
                <Minimize2 className="w-3.5 h-3.5 text-[#2ABDBB]" />
              ) : (
                <Maximize className="w-3.5 h-3.5 text-[#2ABDBB]" />
              )}
              <span>{isFullscreen || isRotatedLandscape ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            </button>
          </div>

          {/* Center: Server Selector (HD-1, SUB, DUB) */}
          <div className="flex items-center gap-1 bg-[#101116] p-1 rounded-xl border border-white/10 flex-shrink-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#8E93A0] uppercase px-1.5 flex items-center gap-1">
              <Server className="w-3 h-3 text-[#F47521]" />
              <span className="hidden sm:inline">Server:</span>
            </span>

            {/* Server 1: Mirror-Box Multi-Server */}
            <button
              type="button"
              onClick={() => setActiveServer('mirrorbox')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeServer === 'mirrorbox'
                  ? 'bg-[#F47521] text-black shadow-sm'
                  : 'text-[#8E93A0] hover:text-white hover:bg-white/5'
              }`}
              title="Primary HD Multi-Server"
            >
              <span>HD-1</span>
            </button>

            {/* Server 2: Megaplay SUB */}
            <button
              type="button"
              onClick={() => setActiveServer('sub')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeServer === 'sub'
                  ? 'bg-[#2ABDBB] text-black shadow-sm'
                  : 'text-[#8E93A0] hover:text-white hover:bg-white/5'
              }`}
              title="Secondary Server SUB (Softsub/Hardsub)"
            >
              <Captions className="w-3.5 h-3.5" />
              <span>SUB</span>
            </button>

            {/* Server 3: Megaplay DUB */}
            <button
              type="button"
              onClick={() => setActiveServer('dub')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeServer === 'dub'
                  ? 'bg-[#FAB818] text-black shadow-sm'
                  : 'text-[#8E93A0] hover:text-white hover:bg-white/5'
              }`}
              title="Secondary Server DUB (English Dubbed)"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>DUB</span>
            </button>
          </div>

          {/* Right Controls: Prev/Next & Download */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {!isMovie && (
              <div className="inline-flex items-center rounded-xl bg-[#101116] p-0.5 border border-white/10">
                <button
                  type="button"
                  disabled={!hasPrevEpisode}
                  onClick={onSelectPrev}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                  title="Previous Episode"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <div className="w-px h-3.5 bg-white/10" />
                <button
                  type="button"
                  disabled={!hasNextEpisode}
                  onClick={onSelectNext}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-black bg-[#F47521] hover:bg-[#FF8533] transition disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer shadow-sm"
                  title="Next Episode"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#2ABDBB]/30 bg-[#2ABDBB]/15 px-3 py-1.5 font-bold text-[#2ABDBB] hover:bg-[#2ABDBB] hover:text-black text-xs transition-all shadow-sm cursor-pointer"
              title="Download direct video file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
