import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bookmark,
  History,
  ChevronDown,
  X,
  Film,
  Calendar,
  Sparkles,
  Flame,
  Menu,
  Download,
  Home,
  Compass
} from 'lucide-react';
import { fetchBrowse } from '../../api/animeApi';
import { getAnimeUrl } from '../../lib/slug';
import { getHighResPoster } from '../../lib/imageUtils';
import { AnimeMedia } from '../../types/anime';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useWatchlist } from '../../lib/userStore';
import { GENRES } from '../../constants/catalog';
import { PWAInstallModal } from '../common/PWAInstallModal';

const MOBILE_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/browse', label: 'Browse All Anime', icon: Compass },
  { to: '/movies', label: 'Anime Movies', icon: Film },
  { to: '/schedule', label: 'Schedule', icon: Calendar }
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canInstall, installApp, showIOSPrompt, setShowIOSPrompt } = usePWAInstall();
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnimeMedia[]>([]);
  // The query the current results belong to; while it lags behind the input a search is pending.
  const [resultsFor, setResultsFor] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const watchlistCount = useWatchlist().length;

  // Separate refs: both inputs exist in the DOM, only one is visible per breakpoint.
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const browseDropdownRef = useRef<HTMLDivElement>(null);
  const trimmedQuery = searchQuery.trim();
  const isSearching = trimmedQuery !== resultsFor;

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setResultsFor('');
  }, []);

  // Close every overlay when the route changes (covers browser back/forward too)
  const [lastPath, setLastPath] = useState(location.pathname + location.search);
  const currentPath = location.pathname + location.search;
  if (currentPath !== lastPath) {
    setLastPath(currentPath);
    setIsBrowseOpen(false);
    setIsMobileMenuOpen(false);
    closeSearch();
  }

  // Debounced live search; stale responses from earlier keystrokes are ignored
  useEffect(() => {
    if (!trimmedQuery) return;

    let isStale = false;
    const timeout = setTimeout(async () => {
      try {
        const data = await fetchBrowse({ search: trimmedQuery, perPage: 6 });
        if (!isStale) {
          setSearchResults(data.media || []);
          setResultsFor(trimmedQuery);
        }
      } catch (e) {
        if (!isStale) {
          setSearchResults([]);
          setResultsFor(trimmedQuery);
        }
        console.error('Search error:', e);
      }
    }, 300);

    return () => {
      isStale = true;
      clearTimeout(timeout);
    };
  }, [trimmedQuery]);

  // Auto focus input when search drawer opens
  useEffect(() => {
    if (!isSearchOpen) return;
    const visibleInput = [mobileSearchInputRef.current, desktopSearchInputRef.current].find(
      (el) => el && el.offsetParent !== null
    );
    visibleInput?.focus();
  }, [isSearchOpen]);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (browseDropdownRef.current && !browseDropdownRef.current.contains(e.target as Node)) {
        setIsBrowseOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsBrowseOpen(false);
        setIsMobileMenuOpen(false);
        closeSearch();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmedQuery) {
      navigate(`/browse?search=${encodeURIComponent(trimmedQuery)}`);
      closeSearch();
    }
  };

  const showResults = Boolean(trimmedQuery);

  const renderSearchResultsList = () => (
    <>
      {isSearching && searchResults.length === 0 && (
        <div className="p-4 text-center text-xs text-[#A0A0A0]">
          Searching…
        </div>
      )}
      {!isSearching && searchResults.length === 0 && (
        <div className="p-4 text-center text-xs text-[#A0A0A0]">
          No titles match “{trimmedQuery}”
        </div>
      )}
      {searchResults.map((anime) => (
        <Link
          key={anime.id}
          to={getAnimeUrl(anime)}
          state={{ anilistId: anime.id }}
          onClick={closeSearch}
          className={`flex items-center gap-3 p-3 hover:bg-white/[0.06] transition border-b border-white/[0.05] last:border-b-0 ${isSearching ? 'opacity-60' : ''}`}
        >
          <img
            src={getHighResPoster(anime)}
            alt=""
            loading="lazy"
            className="w-11 h-15 object-cover rounded-md shadow flex-shrink-0 bg-white/5"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">
              {anime.title.english || anime.title.romaji}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F47521]/20 text-[#F47521]">
                {anime.format}
              </span>
              {anime.averageScore ? (
                <span className="text-xs text-[#FAB818] font-semibold">
                  ★ {(anime.averageScore / 10).toFixed(1)}
                </span>
              ) : null}
              {anime.seasonYear ? (
                <span className="text-xs text-[#A0A0A0]">
                  {anime.seasonYear}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      ))}
      {searchResults.length > 0 && (
        <Link
          to={`/browse?search=${encodeURIComponent(trimmedQuery)}`}
          onClick={closeSearch}
          className="block p-2.5 text-center text-xs font-bold text-[#F47521] bg-black/30 hover:bg-black/50 transition-colors"
        >
          View all results →
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0C10]/90 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Mobile Full-Header Search Overlay */}
      {isSearchOpen && (
        <>
          <div className="md:hidden absolute inset-0 bg-[#0A0B0E] z-50 flex items-center px-3.5 sm:px-4 gap-2.5">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 pointer-events-none" />
              <input
                ref={mobileSearchInputRef}
                type="search"
                aria-label="Search anime"
                enterKeyHint="search"
                placeholder="Search anime, movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1C24] border border-[#F47521]/80 focus:border-[#F47521] text-white pl-9 pr-8 py-2 rounded-full text-xs focus:outline-none shadow-md"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 text-[#A0A0A0] hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
            <button
              type="button"
              onClick={closeSearch}
              className="text-xs font-semibold text-[#A0A0A0] hover:text-white px-2 py-1.5 transition-colors flex-shrink-0"
            >
              Cancel
            </button>
          </div>

          {/* Mobile Instant Search Results Dropdown */}
          {showResults && (
            <div className="md:hidden fixed top-16 left-0 right-0 max-h-[75vh] overflow-y-auto overscroll-contain animate-pop bg-[#16181F]/98 backdrop-blur-xl border-b border-[#363A45] shadow-2xl z-50">
              {renderSearchResultsList()}
            </div>
          )}
        </>
      )}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Zone: Logo & Main Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            {/* Crunchyroll Inspired SVG Logo */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F47521] flex items-center justify-center shadow-lg shadow-[#F47521]/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z" />
              </svg>
            </div>
            <span className="font-display font-black text-base sm:text-xl tracking-tight text-white group-hover:text-[#F47521] transition-colors">
              ANIMORA
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            {/* Browse Mega-Menu Dropdown */}
            <div className="relative" ref={browseDropdownRef}>
              <button
                onClick={() => setIsBrowseOpen(!isBrowseOpen)}
                aria-expanded={isBrowseOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 transition-colors py-2 ${
                  isBrowseOpen ? 'text-[#F47521]' : 'text-white hover:text-[#F47521]'
                }`}
              >
                <span>Browse</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isBrowseOpen ? 'rotate-180 text-[#F47521]' : ''}`} />
              </button>

              {/* Mega-Menu Popover */}
              {isBrowseOpen && (
                <div className="absolute top-full left-0 mt-2 w-[680px] bg-[#181A22]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 grid grid-cols-12 gap-6 z-50 animate-pop">
                  {/* Left Column: Quick Curated Links */}
                  <div className="col-span-4 border-r border-white/[0.08] pr-4 space-y-1.5">
                    <span className="text-xs font-semibold text-[#8E93A0] uppercase tracking-wider block mb-3">
                      Feeds & Formats
                    </span>
                    <Link
                      to="/browse?sort=POPULARITY_DESC"
                      onClick={() => setIsBrowseOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/90 hover:bg-[#F47521]/15 hover:text-[#F47521] transition-all"
                    >
                      <Flame className="w-4 h-4 text-[#F47521]" />
                      <span>Popular Anime</span>
                    </Link>
                    <Link
                      to="/browse?sort=TRENDING_DESC"
                      onClick={() => setIsBrowseOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/90 hover:bg-[#F47521]/15 hover:text-[#F47521] transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-[#FAB818]" />
                      <span>Trending Now</span>
                    </Link>
                    <Link
                      to="/movies"
                      onClick={() => setIsBrowseOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/90 hover:bg-[#F47521]/15 hover:text-[#F47521] transition-all"
                    >
                      <Film className="w-4 h-4 text-[#2ABDBB]" />
                      <span>Anime Movies</span>
                    </Link>
                    <Link
                      to="/calendar"
                      onClick={() => setIsBrowseOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/90 hover:bg-[#F47521]/15 hover:text-[#F47521] transition-all"
                    >
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span>Release Calendar</span>
                    </Link>
                  </div>

                  {/* Right Column: Genre Grid */}
                  <div className="col-span-8">
                    <span className="text-xs font-semibold text-[#8E93A0] uppercase tracking-wider block mb-3">
                      Genres
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {GENRES.map(genre => (
                        <Link
                          key={genre}
                          to={`/browse?genre=${encodeURIComponent(genre)}`}
                          onClick={() => setIsBrowseOpen(false)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#8E93A0] hover:text-white hover:bg-white/10 transition-colors"
                        >
                          {genre}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/movies"
              className="text-white hover:text-[#F47521] transition-colors"
            >
              Movies
            </Link>
            <Link
              to="/schedule"
              className="text-white hover:text-[#F47521] transition-colors"
            >
              Schedule
            </Link>
          </nav>
        </div>

        {/* Right Zone: Search, Watchlist, History */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Top Bar Simple Text Install App Button (Desktop only; on mobile it stays under drawer) */}
          {canInstall && (
            <button
              onClick={installApp}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/90 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors shadow-sm"
              title="Install Animora App"
            >
              <Download className="w-3.5 h-3.5 text-[#F47521]" />
              <span>Install App</span>
            </button>
          )}

          {/* Mobile Search Button Trigger (opens full-header mobile search overlay) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search anime"
            className="md:hidden p-2 text-[#8E93A0] hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Search Anime"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Desktop Search Trigger / Input */}
          <div className="hidden md:block relative">
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  ref={desktopSearchInputRef}
                  type="search"
                  aria-label="Search anime"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 lg:w-80 bg-[#181A22] border border-[#F47521] text-white pl-9 pr-8 py-2 rounded-full text-xs sm:text-sm focus:outline-none shadow-lg transition-all"
                />
                <Search className="w-4 h-4 text-[#8E93A0] absolute left-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="absolute right-2.5 text-[#8E93A0] hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search anime"
                className="p-2 text-[#8E93A0] hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Search Anime"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Desktop Instant Search Results Dropdown */}
            {isSearchOpen && showResults && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-[#181A22]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-pop">
                {renderSearchResultsList()}
              </div>
            )}
          </div>

          {/* Watchlist Icon with badge (Hidden on mobile since it is in bottom nav) */}
          <Link
            to="/watchlist"
            className="hidden md:flex relative p-2 text-[#8E93A0] hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="My Watchlist"
            aria-label={`My Watchlist${watchlistCount ? ` (${watchlistCount})` : ''}`}
          >
            <Bookmark className="w-5 h-5" />
            {watchlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F47521] text-black font-bold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                {watchlistCount > 99 ? '99+' : watchlistCount}
              </span>
            )}
          </Link>

          {/* Watch History Icon */}
          <Link
            to="/watchlist?tab=history"
            className="p-2 text-[#8E93A0] hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Watch History"
            aria-label="Watch History"
          >
            <History className="w-5 h-5" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden p-2 text-[#8E93A0] hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <nav aria-label="Mobile menu" className="md:hidden animate-pop bg-[#16181F]/98 backdrop-blur-2xl border-t border-white/10 px-4 py-3 space-y-1">
          {MOBILE_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/[0.06] hover:text-[#F47521] transition-colors"
            >
              <link.icon className="w-4 h-4 text-[#8E93A0]" />
              {link.label}
            </Link>
          ))}

          {/* Mobile View: Under Drawer Install App Button */}
          {canInstall && (
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  installApp();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4 text-[#F47521]" />
                <span>Install App</span>
              </button>
            </div>
          )}
        </nav>
      )}

      {/* PWA iOS / Fallback Guide Modal */}
      <PWAInstallModal
        isOpen={showIOSPrompt}
        onClose={() => setShowIOSPrompt(false)}
      />
    </header>
  );
};
