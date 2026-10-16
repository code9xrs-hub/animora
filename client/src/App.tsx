import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ReactLenis, useLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { MoviesPage } from './pages/MoviesPage';
import { CalendarPage } from './pages/CalendarPage';
import { SeriesDetailPage } from './pages/SeriesDetailPage';
import { WatchPage } from './pages/WatchPage';
import { WatchlistPage } from './pages/WatchlistPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  return null;
}

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
      <BrowserRouter>
        <ScrollToTop />
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
        </div>
      </BrowserRouter>
    </ReactLenis>
  );
}

export default App;
