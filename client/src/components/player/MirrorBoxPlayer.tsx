import React, { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, Moon, Sun, Maximize2, Minimize2, Server, Volume2, Captions } from 'lucide-react';
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

  const initialStream = activeEpisode.mirrorBoxStream;
  const isMovie = initialStream?.mediaType === 'movie';

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
  const externalId = stream?.externalId || (anilistId ? String(anilistId) : String(epNum));

  // Compute active embed URL based on chosen server
  let embedUrl = stream?.embedUrl || (isMovie
    ? `https://mirrorboxapi.web.app/movie/${externalId}`
    : `https://mirrorboxapi.web.app/tv/${externalId}/1/${epNum}`);

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
    : `https://mirrorboxapi.web.app/download/tv/${externalId}/1/${epNum}`);

  // Reset loading state on episode or server change
  useEffect(() => {
    setIframeLoaded(false);
  }, [activeServer, activeEpisode.episodeNumber, embedUrl]);

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
        {/* 16:9 Responsive Iframe Container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#141519] shadow-2xl ring-1 ring-white/10">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#141519] text-white z-10 px-4 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#F47521] border-t-transparent" />
              <p className="text-sm font-medium text-[#A0A0A0]">
                Connecting to{' '}
                {activeServer === 'mirrorbox'
                  ? 'Mirror-Box Multi-Server CDN'
                  : activeServer === 'sub'
                  ? 'Megaplay SUB Server'
                  : 'Megaplay DUB Server'}{' '}
                for {animeTitle} {!isMovie && `(Episode ${activeEpisode.episodeNumber})`}...
              </p>
              <span className="text-xs text-[#4A4E58]">
                {activeServer === 'mirrorbox'
                  ? 'Adaptive Multi-Server Stream: Abyss, FileMoon, Vidmoly, Streamwish'
                  : activeServer === 'sub'
                  ? 'Secondary Server: High-Speed Subtitled Stream (Megaplay)'
                  : 'Secondary Server: High-Speed English Dubbed Stream (Megaplay)'}
              </span>
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
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="origin"
            onLoad={() => setIframeLoaded(true)}
            style={{
              aspectRatio: '16/9',
              border: 'none',
              borderRadius: '12px',
              background: '#000',
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Crunchyroll-Style Player Action Bar */}
        <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 rounded-lg bg-[#23252B] px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white border border-[#4A4E58]/30">
          {/* Left Controls: Lights & Theater Mode */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setLightsOff((prev) => !prev)}
              className="flex items-center gap-1 sm:gap-1.5 rounded px-2.5 sm:px-3 py-1 sm:py-1.5 font-medium text-[#A0A0A0] transition hover:bg-white/10 hover:text-white text-[11px] sm:text-xs"
            >
              {lightsOff ? <Sun className="w-3.5 h-3.5 text-[#FAB818]" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{lightsOff ? 'Lights On' : 'Lights Off'}</span>
            </button>

            <button
              onClick={() => setIsTheaterMode((prev) => !prev)}
              className="hidden sm:flex items-center gap-1.5 rounded px-3 py-1.5 font-medium text-[#A0A0A0] transition hover:bg-white/10 hover:text-white text-xs"
            >
              {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{isTheaterMode ? 'Standard' : 'Theater Mode'}</span>
            </button>
          </div>

          {/* Center: Server Selector (Mirror-Box, SUB, DUB) */}
          <div className="flex items-center gap-1 bg-[#141519] p-1 rounded-lg border border-[#4A4E58]/40">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#A0A0A0] uppercase px-1.5 sm:px-2 flex items-center gap-1">
              <Server className="w-3 h-3 text-[#F47521]" />
              <span className="hidden xs:inline">Server:</span>
            </span>

            {/* Server 1: Mirror-Box Multi-Server */}
            <button
              onClick={() => setActiveServer('mirrorbox')}
              className={`px-2.5 sm:px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                activeServer === 'mirrorbox'
                  ? 'bg-[#F47521] text-black shadow font-black'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
              }`}
              title="Primary HD Multi-Server (Abyss, FileMoon, Vidmoly, Streamwish)"
            >
              <span>HD-1</span>
              <span className="hidden sm:inline text-[10px] opacity-80">(Multi)</span>
            </button>

            {/* Server 2: Megaplay SUB */}
            <button
              onClick={() => setActiveServer('sub')}
              className={`px-2.5 sm:px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                activeServer === 'sub'
                  ? 'bg-[#2ABDBB] text-black shadow font-black'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
              }`}
              title="Secondary Server SUB (Megaplay Softsub/Hardsub)"
            >
              <Captions className="w-3.5 h-3.5" />
              <span>SUB</span>
            </button>

            {/* Server 3: Megaplay DUB */}
            <button
              onClick={() => setActiveServer('dub')}
              className={`px-2.5 sm:px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                activeServer === 'dub'
                  ? 'bg-[#FAB818] text-black shadow font-black'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
              }`}
              title="Secondary Server DUB (Megaplay English Dubbed)"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>DUB</span>
            </button>
          </div>

          {/* Right Controls: Prev/Next & Download */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {!isMovie && (
              <>
                <button
                  disabled={!hasPrevEpisode}
                  onClick={onSelectPrev}
                  className="flex items-center gap-1 rounded bg-[#141519] px-2.5 sm:px-3 py-1 sm:py-1.5 font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40 text-[11px] sm:text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  disabled={!hasNextEpisode}
                  onClick={onSelectNext}
                  className="flex items-center gap-1 rounded bg-[#F47521] px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-bold text-black transition hover:bg-[#FF8533] disabled:cursor-not-allowed disabled:opacity-40 text-[11px] sm:text-xs"
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
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded border border-[#2ABDBB] bg-[#2ABDBB]/15 px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-bold text-[#2ABDBB] transition hover:bg-[#2ABDBB] hover:text-black text-[11px] sm:text-xs shadow"
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
