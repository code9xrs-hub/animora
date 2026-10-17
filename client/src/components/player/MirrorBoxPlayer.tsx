import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Download,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Server,
  Volume2,
  Captions,
  RotateCw,
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
  const [isTheaterMode, setIsTheaterMode] = useState(false);
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

  // Toggle rotation / fullscreen handler
  const handleToggleRotate = async () => {
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
      } catch (err) {
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
  };

  return (
    <section className="relative w-full bg-black py-4">
      {/* Lights-Off Backdrop Overlay */}
      {lightsOff && (
        <div
          onClick={() => setLightsOff(false)}
          className="fixed inset-0 z-30 bg-black/92 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
          title="Click to turn lights back on"
        />
      )}

      <div
        className={`relative z-40 mx-auto w-full transition-all duration-300 ${
          isTheaterMode ? 'max-w-full px-2 sm:px-4' : 'max-w-[1280px] px-4'
        }`}
      >
        {/* 16:9 Responsive Iframe Container with Full Rotation Support */}
        <div
          ref={playerContainerRef}
          className={`relative aspect-video w-full overflow-hidden bg-[#141519] shadow-2xl ring-1 ring-white/10 ${
            isRotatedLandscape
              ? 'fixed top-0 left-[100vw] w-[100vh] h-[100vw] rotate-90 origin-top-left z-[99999] rounded-none !aspect-auto'
              : isTheaterMode
                ? 'rounded-none'
                : 'rounded-xl'
          }`}
        >
          {/* Exit Rotate Floating Badge */}
          {isRotatedLandscape && (
            <button
              onClick={() => setIsRotatedLandscape(false)}
              className="absolute top-4 right-4 z-50 bg-black/80 hover:bg-[#F47521] text-white hover:text-black px-3 py-1.5 rounded-full shadow-lg transition-all flex items-center gap-1.5 text-xs font-bold border border-white/20"
              title="Exit Landscape Rotation"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Exit Rotation</span>
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

        {/* Crunchyroll-Style Player Action Bar */}
        <div className="mt-3 sm:mt-3.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 rounded-2xl bg-[#181A20] px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white border border-white/[0.08] shadow-sm">
          {/* Left Controls: Lights, Theater Mode & Rotation */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setLightsOff((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium text-[#8E93A0] transition-colors hover:bg-white/10 hover:text-white text-xs"
            >
              {lightsOff ? <Sun className="w-3.5 h-3.5 text-[#FAB818]" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{lightsOff ? 'Lights On' : 'Lights Off'}</span>
            </button>

            <button
              onClick={() => setIsTheaterMode((prev) => !prev)}
              className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium text-[#8E93A0] transition-colors hover:bg-white/10 hover:text-white text-xs"
            >
              {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{isTheaterMode ? 'Standard' : 'Theater Mode'}</span>
            </button>

            <button
              onClick={handleToggleRotate}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium text-[#8E93A0] transition-colors hover:bg-white/10 hover:text-white text-xs"
              title="Rotate player to landscape or enter fullscreen"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#2ABDBB]" />
              <span>Rotate</span>
            </button>
          </div>

          {/* Center: Server Selector (Mirror-Box, SUB, DUB) */}
          <div className="flex items-center gap-1 bg-[#121318] p-1 rounded-xl border border-white/10">
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#8E93A0] uppercase px-2 flex items-center gap-1">
              <Server className="w-3 h-3 text-[#F47521]" />
              <span className="hidden xs:inline">Server:</span>
            </span>

            {/* Server 1: Mirror-Box Multi-Server */}
            <button
              onClick={() => setActiveServer('mirrorbox')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${activeServer === 'mirrorbox'
                  ? 'bg-[#F47521] text-black shadow-sm font-bold'
                  : 'text-[#8E93A0] hover:text-white hover:bg-white/5'
                }`}
              title="Primary HD Multi-Server (Abyss, FileMoon, Vidmoly, Streamwish)"
            >
              <span>HD-1</span>
              <span className="hidden sm:inline text-[10px] opacity-75">(Multi)</span>
            </button>

            {/* Server 2: Megaplay SUB */}
            <button
              onClick={() => setActiveServer('sub')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeServer === 'sub'
                  ? 'bg-[#2ABDBB] text-black shadow-sm font-bold'
                  : 'text-[#8E93A0] hover:text-white hover:bg-white/5'
                }`}
              title="Secondary Server SUB (Megaplay Softsub/Hardsub)"
            >
              <Captions className="w-3.5 h-3.5" />
              <span>SUB</span>
            </button>

            {/* Server 3: Megaplay DUB */}
            <button
              onClick={() => setActiveServer('dub')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeServer === 'dub'
                  ? 'bg-[#FAB818] text-black shadow-sm font-bold'
                  : 'text-[#8E93A0] hover:text-white hover:bg-white/5'
                }`}
              title="Secondary Server DUB (Megaplay English Dubbed)"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>DUB</span>
            </button>
          </div>

          {/* Right Controls: Prev/Next & Download */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isMovie && (
              <>
                <button
                  disabled={!hasPrevEpisode}
                  onClick={onSelectPrev}
                  className="flex items-center gap-1 rounded-xl bg-[#121318] px-3 py-1.5 font-medium text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 text-xs border border-white/5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  disabled={!hasNextEpisode}
                  onClick={onSelectNext}
                  className="flex items-center gap-1 rounded-xl bg-[#F47521] px-3.5 py-1.5 font-bold text-black transition hover:bg-[#FF8533] disabled:cursor-not-allowed disabled:opacity-30 text-xs shadow-sm"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#2ABDBB]/40 bg-[#2ABDBB]/15 px-3 py-1.5 font-semibold text-[#2ABDBB] transition hover:bg-[#2ABDBB] hover:text-black text-xs shadow-sm"
              title="Download direct video file via Mirror-Box CDN"
            >
              <Download className="w-3.5 h-3.5" />
              <span><span className="hidden xs:inline">Direct </span>Download</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
