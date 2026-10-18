import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-[#0E0F12] border-t border-[#1F2026] pt-3.5 pb-20 md:py-7 text-[#8E93A0] text-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Brand on Left, Navigation and Data & Streaming grouped on Right Side */}
        <div className="hidden md:flex justify-between items-start gap-8 pb-6 border-b border-[#1A1C22]">

          {/* Left Side: Brand */}
          <div className="space-y-2 max-w-xs">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#F47521] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-black fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z" />
                </svg>
              </div>
              <span className="font-display font-black text-white text-sm tracking-wide">
                ANIMORA
              </span>
            </Link>
            <p className="text-[11px] text-[#6E7380] leading-relaxed">
              Fast, high-speed anime catalog and streaming platform.
            </p>
          </div>

          {/* Right Side: Navigation & Data & Streaming */}
          <div className="flex items-start gap-12 lg:gap-16">
            {/* Navigation */}
            <div>
              <h4 className="text-white font-semibold text-[11px] uppercase tracking-wider mb-2.5">
                Navigation
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <Link to="/browse?sort=POPULARITY_DESC" className="hover:text-white transition-colors">
                    Popular Anime
                  </Link>
                </li>
                <li>
                  <Link to="/calendar" className="hover:text-white transition-colors">
                    Simulcast Season
                  </Link>
                </li>
                <li>
                  <Link to="/movies" className="hover:text-white transition-colors">
                    Anime Movies
                  </Link>
                </li>
                <li>
                  <Link to="/browse" className="hover:text-white transition-colors">
                    Release Calendar
                  </Link>
                </li>
              </ul>
            </div>

            {/* Data & Streaming */}
            <div>
              <h4 className="text-white font-semibold text-[11px] uppercase tracking-wider mb-2.5">
                Data & Streaming
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <a
                    href="https://anilist.co"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    AniList GraphQL API v2
                  </a>
                </li>
                <li>
                  <a
                    href="https://mirrorboxapi.web.app"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Mirror-Box API
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Fribb/anime-lists"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Fribb Crosswalk Index
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/code9xrs-hub/animora.git"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Source Code
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Clean Compact Bottom Row */}
        <div className="pt-0 md:pt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-[11px] text-[#636875] text-center sm:text-left">
          <p>© {new Date().getFullYear()} Animora. All rights reserved.</p>
          <div className="flex items-center gap-3 sm:gap-4">
            <span>English (US)</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
