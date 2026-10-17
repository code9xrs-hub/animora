import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Film, Calendar, Bookmark } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [watchlistCount, setWatchlistCount] = useState(0);

  // Sync watchlist count from localStorage
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

  const navItems = [
    {
      name: 'Home',
      to: '/',
      icon: Home,
      isActive: currentPath === '/'
    },
    {
      name: 'Browse',
      to: '/browse',
      icon: Compass,
      isActive: currentPath.startsWith('/browse')
    },
    {
      name: 'Movies',
      to: '/movies',
      icon: Film,
      isActive: currentPath.startsWith('/movies') || currentPath.startsWith('/movie/')
    },
    {
      name: 'Calendar',
      to: '/calendar',
      icon: Calendar,
      isActive: currentPath.startsWith('/calendar')
    },
    {
      name: 'Watchlist',
      to: '/watchlist',
      icon: Bookmark,
      isActive: currentPath.startsWith('/watchlist'),
      badge: watchlistCount > 0 ? watchlistCount : null
    }
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#101116]/95 backdrop-blur-xl border-t border-[#23252E] shadow-[0_-4px_24px_rgba(0,0,0,0.6)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.to}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 select-none active:scale-95 ${
                item.isActive ? 'text-[#F47521]' : 'text-[#8A8F9D] hover:text-white'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    item.isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(244,117,33,0.4)]' : ''
                  }`}
                  strokeWidth={item.isActive ? 2.4 : 2}
                />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-[#F47521] text-black font-black text-[9px] min-w-3.5 h-3.5 px-1 rounded-full flex items-center justify-center border border-black shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 transition-colors ${
                  item.isActive ? 'font-bold text-[#F47521]' : 'font-medium'
                }`}
              >
                {item.name}
              </span>
              {item.isActive && (
                <span className="w-1 h-1 rounded-full bg-[#F47521] mt-0.5 shadow-sm shadow-[#F47521]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
