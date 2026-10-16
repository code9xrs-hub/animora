import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-[#000000] border-t border-[#2B2E36] py-12 text-[#A0A0A0] text-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Navigation</h4>
            <ul className="space-y-2.5">
              <li><Link to="/browse?sort=POPULARITY_DESC" className="hover:text-white transition">Popular Anime</Link></li>
              <li><Link to="/calendar" className="hover:text-white transition">Simulcast Season</Link></li>
              <li><Link to="/movies" className="hover:text-white transition">Anime Movies</Link></li>
              <li><Link to="/browse" className="hover:text-white transition">Release Calendar</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Features</h4>
            <ul className="space-y-2.5">
              <li><span className="text-[#2ABDBB]">Direct 1080p/4K Downloads</span></li>
              <li><span>Adaptive Multi-Server Playback</span></li>
              <li><span>Auto Next & Queue Advance</span></li>
              <li><span>Custom Theater Mode</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Data & Streaming</h4>
            <ul className="space-y-2.5">
              <li><a href="https://anilist.co" target="_blank" rel="noreferrer" className="hover:text-white transition">AniList GraphQL API v2</a></li>
              <li><a href="https://mirrorboxapi.web.app" target="_blank" rel="noreferrer" className="hover:text-white transition">Mirror-Box API</a></li>
              <li><a href="https://github.com/Fribb/anime-lists" target="_blank" rel="noreferrer" className="hover:text-white transition">Fribb Crosswalk Index</a></li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-[#F47521] flex items-center justify-center">
                <svg className="w-4 h-4 text-black fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z" />
                </svg>
              </div>
              <span className="font-display font-black text-white text-base">ANIMORA</span>
            </div>
            <p className="text-xs leading-relaxed text-[#A0A0A0]">
              Full-featured anime catalog, discovery, and high-speed streaming platform.
            </p>
          </div>
        </div>

        <div className="border-t border-[#2B2E36] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Animora. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-white">English (US)</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
