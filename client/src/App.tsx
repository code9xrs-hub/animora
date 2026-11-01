import React, { useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { HomePage } from './pages/HomePage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const BrowsePage = lazy(() => import('./pages/BrowsePage').then(m => ({ default: m.BrowsePage })));
const MoviesPage = lazy(() => import('./pages/MoviesPage').then(m => ({ default: m.MoviesPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const SeriesDetailPage = lazy(() => import('./pages/SeriesDetailPage').then(m => ({ default: m.SeriesDetailPage })));
const WatchPage = lazy(() => import('./pages/WatchPage').then(m => ({ default: m.WatchPage })));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage').then(m => ({ default: m.WatchlistPage })));

/**
 * Ultra-Light, Non-Blocking Scroll Restoration Handler
 * Eliminates artificial scroll lag, requestAnimationFrame reflow loops, and layout thrashing.
 */
function ScrollRestorationHandler() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const currentPathKey = location.pathname + location.search;
  const prevPathKeyRef = useRef<string | null>(null);

  // Set manual scroll restoration to control exactly when scroll resets occur
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Save scroll position throttled using requestAnimationFrame (passive, zero layout thrashing)
  useEffect(() => {
    let ticking = false;

    const saveCurrentScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const storageKey = `animora_scroll_${currentPathKey}`;
      try {
        sessionStorage.setItem(storageKey, String(Math.max(0, Math.round(scrollY))));
      } catch {}
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          saveCurrentScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', saveCurrentScroll);
    window.addEventListener('pagehide', saveCurrentScroll);

    return () => {
      saveCurrentScroll();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', saveCurrentScroll);
      window.removeEventListener('pagehide', saveCurrentScroll);
    };
  }, [currentPathKey]);

  // Handle route change / page reload scroll position
  useEffect(() => {
    const isNewRoute = prevPathKeyRef.current !== null && prevPathKeyRef.current !== currentPathKey;
    const isPushNav = isNewRoute && navigationType === 'PUSH';
    prevPathKeyRef.current = currentPathKey;

    const storageKey = `animora_scroll_${currentPathKey}`;

    if (isPushNav) {
      try {
        sessionStorage.removeItem(storageKey);
      } catch {}
      window.scrollTo(0, 0);
      return;
    }

    let targetY = 0;
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved !== null) {
        targetY = Math.max(0, parseInt(saved, 10) || 0);
      }
    } catch {
      targetY = 0;
    }

    if (targetY > 0) {
      window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
      // Re-apply once after initial paint to ensure dynamic DOM content fits
      const settleTimer = setTimeout(() => {
        window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
      }, 100);
      return () => clearTimeout(settleTimer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [currentPathKey, navigationType]);

  return null;
}

function RouteFallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center" aria-busy="true" aria-label="Loading page">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-cr-orange" />
    </div>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();
  // Episode switches on the watch page should not re-trigger the page transition.
  const transitionKey = pathname.startsWith('/watch/') ? '/watch' : pathname;

  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<RouteFallback />}>
        <div key={transitionKey} className="animate-page">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            {/* Semantic Slug Routes */}
            <Route path="/series/:slug" element={<SeriesDetailPage />} />
            <Route path="/movie/:slug/:year" element={<SeriesDetailPage />} />
            <Route path="/movie/:slug" element={<SeriesDetailPage />} />
            <Route path="/watch/:slug/:year" element={<WatchPage />} />
            <Route path="/watch/:slug" element={<WatchPage />} />
            {/* Legacy Numeric ID Routes */}
            <Route path="/series/:id" element={<SeriesDetailPage />} />
            <Route path="/movie/:id" element={<SeriesDetailPage />} />
            <Route path="/watch/:id" element={<WatchPage />} />
            <Route path="/watch/:id/ep/:episodeNumber" element={<WatchPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollRestorationHandler />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-cr-orange focus:px-4 focus:py-2 focus:font-bold focus:text-black"
      >
        Skip to content
      </a>
      <div className="flex flex-col min-h-screen bg-[#0B0C10] text-white">
        <Navbar />
        <main id="main-content" className="flex-1">
          <AppRoutes />
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
