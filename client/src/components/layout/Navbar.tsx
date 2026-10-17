import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Menu
} from 'lucide-react';
import { fetchBrowse } from '../../api/animeApi';
import { AnimeMedia } from '../../types/anime';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Psychological', 'Romance',
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnimeMedia[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const browseDropdownRef = useRef<HTMLDivElement>(null);

  // Sync Watchlist Count
  const updateWatchlistCount = () => {
    try {
      const stored = localStorage.getItem('animora_watchlist') || localStorage.getItem('crunchyroll_watchlist');
      if (stored) {
        const list = JSON.parse(stored);
        setWatchlistCount(list.length);
      } else {
        setWatchlistCount(0);
      }
    } catch {
      setWatchlistCount(0);
    }
  };

  useEffect(() => {
    updateWatchlistCount();
    window.addEventListener('watchlist_updated', updateWatchlistCount);
    return () => window.removeEventListener('watchlist_updated', updateWatchlistCount);
  }, []);

  // Debounced Live Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await fetchBrowse({ search: searchQuery, perPage: 6 });
        setSearchResults(data.media || []);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Auto focus input when search drawer opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (browseDropdownRef.current && !browseDropdownRef.current.contains(e.target as Node)) {
        setIsBrowseOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const renderSearchResultsList = () => (
    <>
      {isSearching && (
        <div className="p-3 text-center text-xs text-[#A0A0A0]">
          Searching AniList catalog...
        </div>
      )}
      {!isSearching && searchResults.map((anime) => (
        <Link
          key={anime.id}
          to={anime.format === 'MOVIE' ? `/movie/${anime.id}` : `/series/${anime.id}`}
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
          className="flex items-center gap-3 p-3 hover:bg-[#2B2E36] transition border-b border-[#4A4E58]/30 last:border-b-0"
        >
          <img
            src={anime.coverImage?.large || anime.coverImage?.extraLarge}
            alt={anime.title.english || anime.title.romaji}
            className="w-12 h-16 object-cover rounded shadow flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">
              {anime.title.english || anime.title.romaji}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F47521]/20 text-[#F47521]">
                {anime.format}
              </span>
              {anime.averageScore && (
                <span className="text-xs text-[#FAB818] font-semibold">
                  ★ {(anime.averageScore / 10).toFixed(1)}
                </span>
              )}
              {anime.seasonYear && (
                <span className="text-xs text-[#A0A0A0]">
                  {anime.seasonYear}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
      {!isSearching && searchResults.length > 0 && (
        <Link
          to={`/browse?search=${encodeURIComponent(searchQuery)}`}
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
          className="block p-2.5 text-center text-xs font-bold text-[#F47521] bg-[#141519] hover:underline"
        >
          View all matching results →
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-[#000000]/95 backdrop-blur-md border-b border-[#2B2E36]/80">
      {/* Mobile Full-Header Search Overlay */}
      {isSearchOpen && (
        <>
          <div className="md:hidden absolute inset-0 bg-[#0A0B0E] z-50 flex items-center px-3.5 sm:px-4 gap-2.5">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                placeholder="Search anime, movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1C24] border border-[#F47521]/80 focus:border-[#F47521] text-white pl-9 pr-8 py-2 rounded-full text-xs focus:outline-none shadow-md"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#A0A0A0] hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-[#A0A0A0] hover:text-white px-2 py-1.5 transition-colors flex-shrink-0"
            >
              Cancel
            </button>
          </div>

          {/* Mobile Instant Search Results Dropdown */}
          {(searchResults.length > 0 || isSearching) && (
            <div className="md:hidden fixed top-16 left-0 right-0 max-h-[75vh] overflow-y-auto bg-[#1C1E25]/98 backdrop-blur-xl border-b border-[#363A45] shadow-2xl z-50">
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
                className={`flex items-center gap-1.5 transition-colors py-2 ${
                  isBrowseOpen ? 'text-[#F47521]' : 'text-white hover:text-[#F47521]'
                }`}
              >
                <span>Browse</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isBrowseOpen ? 'rotate-180 text-[#F47521]' : ''}`} />
              </button>

              {/* Mega-Menu Popover */}
              {isBrowseOpen && (
                <div className="absolute top-full left-0 mt-2 w-[680px] bg-[#181A22]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 grid grid-cols-12 gap-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
              to="/calendar"
              className="text-white hover:text-[#F47521] transition-colors"
            >
              Simulcast Calendar
            </Link>
          </nav>
        </div>

        {/* Right Zone: Search, Watchlist, History */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Button Trigger (opens full-header mobile search overlay) */}
          <button
            onClick={() => {
              setIsSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
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
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 lg:w-80 bg-[#181A22] border border-[#F47521] text-white pl-9 pr-8 py-2 rounded-full text-xs sm:text-sm focus:outline-none shadow-lg transition-all"
                />
                <Search className="w-4 h-4 text-[#8E93A0] absolute left-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-2.5 text-[#8E93A0] hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className="p-2 text-[#8E93A0] hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Search Anime"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Desktop Instant Search Results Dropdown */}
            {isSearchOpen && (searchResults.length > 0 || isSearching) && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-[#181A22]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                {renderSearchResultsList()}
              </div>
            )}
          </div>

          {/* Watchlist Icon with badge (Hidden on mobile since it is in bottom nav) */}
          <Link
            to="/watchlist"
            className="hidden md:flex relative p-2 text-[#8E93A0] hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="My Watchlist"
          >
            <Bookmark className="w-5 h-5" />
            {watchlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F47521] text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {watchlistCount}
              </span>
            )}
          </Link>

          {/* Watch History Icon */}
          <Link
            to="/watchlist?tab=history"
            className="p-2 text-[#8E93A0] hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Watch History"
          >
            <History className="w-5 h-5" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#8E93A0] hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#181A22]/98 backdrop-blur-2xl border-t border-white/10 px-4 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-white font-semibold hover:text-[#F47521] transition-colors"
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-white font-semibold hover:text-[#F47521] transition-colors"
          >
            Browse All Anime
          </Link>
          <Link
            to="/movies"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-white font-semibold hover:text-[#F47521] transition-colors"
          >
            Anime Movies
          </Link>
          <Link
            to="/calendar"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-white font-semibold hover:text-[#F47521] transition-colors"
          >
            Simulcast Calendar
          </Link>
        </div>
      )}
    </header>
  );
};
