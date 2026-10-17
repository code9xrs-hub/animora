import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { ReactLenis, useLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { MoviesPage } from './pages/MoviesPage';
import { CalendarPage } from './pages/CalendarPage';
import { SeriesDetailPage } from './pages/SeriesDetailPage';
import { WatchPage } from './pages/WatchPage';
import { WatchlistPage } from './pages/WatchlistPage';

function ScrollRestorationHandler() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const lenis = useLenis();

  const currentPathKey = location.pathname + location.search;
  const isRestoringRef = useRef(false);
  const userInteractedRef = useRef(false);
  const prevPathKeyRef = useRef<string | null>(null);

  // Disable browser's native automatic scroll restoration to avoid erratic jumps before dynamic content renders
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Save scroll position for the current path
  useEffect(() => {
    const saveCurrentScroll = () => {
      if (isRestoringRef.current) return;
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const storageKey = `animora_scroll_${currentPathKey}`;
      try {
        sessionStorage.setItem(storageKey, String(Math.max(0, Math.round(scrollY))));
      } catch {
        // Ignore quota/private mode errors
      }
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          saveCurrentScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleUserInteraction = () => {
      userInteractedRef.current = true;
      isRestoringRef.current = false;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', saveCurrentScroll);
    window.addEventListener('pagehide', saveCurrentScroll);

    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      saveCurrentScroll();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', saveCurrentScroll);
      window.removeEventListener('pagehide', saveCurrentScroll);

      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [currentPathKey]);

  // Handle route change / page reload scroll position
  useEffect(() => {
    const isNewRoute = prevPathKeyRef.current !== null && prevPathKeyRef.current !== currentPathKey;
    const isPushNav = isNewRoute && navigationType === 'PUSH';
    prevPathKeyRef.current = currentPathKey;

    let targetY = 0;
    const storageKey = `animora_scroll_${currentPathKey}`;

    if (isPushNav) {
      targetY = 0;
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        // Ignore
      }
    } else {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved !== null) {
          targetY = Math.max(0, parseInt(saved, 10) || 0);
        }
      } catch {
        targetY = 0;
      }
    }

    userInteractedRef.current = false;

    if (targetY === 0) {
      isRestoringRef.current = false;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo(0, 0);
      return;
    }

    isRestoringRef.current = true;

    const performScroll = () => {
      if (userInteractedRef.current) return;
      if (lenis) {
        lenis.scrollTo(targetY, { immediate: true });
      }
      window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
    };

    performScroll();

    const maxDuration = 3000;
    const startTime = Date.now();
    let animationFrameId: number;
    let observer: ResizeObserver | null = null;

    const checkAndRestore = () => {
      if (userInteractedRef.current) {
        isRestoringRef.current = false;
        return;
      }

      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const maxScrollPossible = Math.max(0, scrollHeight - window.innerHeight);

      performScroll();

      const reachedTarget = Math.abs(currentScroll - targetY) <= 3;
      const canFitTarget = maxScrollPossible >= targetY - 20;

      if (Date.now() - startTime >= maxDuration) {
        isRestoringRef.current = false;
        return;
      }

      if (reachedTarget && canFitTarget) {
        setTimeout(() => {
          if (!userInteractedRef.current) {
            performScroll();
            isRestoringRef.current = false;
          }
        }, 150);
        return;
      }

      animationFrameId = requestAnimationFrame(checkAndRestore);
    };

    animationFrameId = requestAnimationFrame(checkAndRestore);

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        if (!userInteractedRef.current && isRestoringRef.current) {
          performScroll();
        }
      });
      if (document.body) observer.observe(document.body);
      if (document.documentElement) observer.observe(document.documentElement);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [currentPathKey, navigationType, lenis]);

  return null;
}

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
      <BrowserRouter>
        <ScrollRestorationHandler />
        <div className="flex flex-col min-h-screen bg-[#141519] text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/series/:id" element={<SeriesDetailPage />} />
              <Route path="/movie/:id" element={<SeriesDetailPage />} />
              <Route path="/watch/:id" element={<WatchPage />} />
              <Route path="/watch/:id/ep/:episodeNumber" element={<WatchPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
            </Routes>
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      </BrowserRouter>
    </ReactLenis>
  );
}

export default App;
