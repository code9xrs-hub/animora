<div align="center">

# 🎬 Animora — Next-Gen Anime & Movie Streaming Platform

<p align="center">
  <b>A blazing-fast, cinema-grade anime streaming web application & Progressive Web App (PWA).</b><br>
  Powered by React 19, Vite 6, Tailwind CSS v4, AniList GraphQL v2, Semantic SEO Routing, and real-time multi-server streaming.
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-F58220.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.x-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-F58220?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Firebase Hosting](https://img.shields.io/badge/Firebase-Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![AniList API](https://img.shields.io/badge/Metadata-AniList_GraphQL_v2-02A9FF?style=for-the-badge&logo=anilist&logoColor=white)](https://anilist.co/)

<br>

[🌐 **Live Demo Website**](https://animora.web.app/) • [📦 **GitHub Repository**](https://github.com/code9xrs-hub/animora) • [🐛 **Report an Issue**](https://github.com/code9xrs-hub/animora/issues)

</div>

---

## 🌟 What is Animora?

**Animora** is an ultra-modern, high-performance anime streaming single-page application and installable **Progressive Web App (PWA)** engineered with a cinema-grade dark aesthetic inspired by Crunchyroll.

It combines the vast catalog of **AniList GraphQL v2** with high-speed multi-server streaming (**Mirror-Box API** + **Megaplay SUB/DUB**), driven by a **100% Real-Time AniList-to-TMDb Crosswalk Engine** that requires **zero static mapping databases** or bundle bloat.

### ⚡ Highlights at a Glance
- 🔗 **Clean Semantic SEO Routing:** Beautiful, human-readable URLs for all pages:
  - Series Detail: `/series/:title-season-:num` (e.g., `/series/solo-leveling-season-1`)
  - Episode Playback: `/watch/:title-:seasonx:episode` (e.g., `/watch/solo-leveling-1x2`)
  - Feature Films: `/movie/:title/:year` & `/watch/:title/:year` (e.g., `/movie/your-name/2016`)
  - *Full Backwards Compatibility:* Legacy numeric URLs (`/series/186541`, `/movie/21519`, `/watch/186541/ep/1`) automatically resolve and upgrade to semantic slugs seamlessly.
- 📱 **Progressive Web App (PWA):** 1-click installable app on iOS Safari, Android Chrome, and Desktop Chrome/Edge with standalone window experience and offline fallback.
- 🖼️ **Full-Bleed Clean Hero Slider:** Pure full-bleed artwork slider with smooth directional cinema gradients and 1:1 real-time touch gesture dragging.
- 📺 **Side-by-Side Cinema Watch View:** Desktop 8-column cinema player paired alongside a 4-column scrollable season episode queue for rapid, distraction-free binge watching.
- 🪟 **Picture-in-Picture (PiP) Ready:** Full `picture-in-picture` and `autoPictureInPicture` iframe controls for multitasking while watching.
- 🎭 **Featured Characters & Cast:** Smooth horizontal round-avatar cast carousel highlighting voice actors and character roles with zero layout shift.
- 🍱 **Balanced 3-per-Row Episode Grid:** Symmetrical, compact 3-column episode layout on both mobile and desktop viewports with watched progress indicators.
- 🧭 **Centerpiece Mobile Bottom Nav:** Ergonomic thumb-friendly navigation bar with prominent center **Home** action (`Browse | Movies | Home | Calendar | Watchlist`).
- 🍿 **Cinematic Movies Hub:** Full-width hero banner carousel and left-to-right horizontal swimlanes for *Popular*, *Top Rated*, and *Newest* feature films.
- 🔍 **Google Search Console & Verified SEO:** Verified Google Search Console ownership, automated `sitemap.xml`, `robots.txt`, JSON-LD schema, and canonical links.
- 🚀 **Extreme Bundle Optimization:** Route-level code splitting dropping initial JS load to just **~69 KB** (84% reduction!) and sub-second builds (~1s).
- 🎬 **Multi-Server Cinema Theater:** 3 dedicated servers (HD-1 Multi-Mirror, SUB, DUB) with landscape rotation lock and feature-policy iframe controls.
- 🔄 **Real-Time Dynamic Crosswalk & Zero-Reload Switcher:** Translates AniList IDs to TMDb/IMDb on the fly via `api.ani.zip` and `arm.haglund.dev`, with in-place episode switches that eliminate full page reloads.
- 📅 **7-Day AniKoto Airing Schedule:** Real-time weekly lineup powered by the AniKoto schedule API, complete with live countdowns, broadcast status badges (AIRED vs upcoming), and local timezone conversion.
- 🎬 **Isolated Trailer Modal:** React Portal-driven cinema trailer player (`createPortal`) providing true viewport centering and zero scroll leakage across mobile and desktop.

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [🔗 Semantic URL Routing Architecture](#-semantic-url-routing-architecture)
- [📺 Cinema Player & Watch Experience](#-cinema-player--watch-experience)
- [📱 Progressive Web App (PWA) System](#-progressive-web-app-pwa-system)
- [🎠 Clean Full-Bleed Hero Carousel](#-clean-full-bleed-hero-carousel)
- [🧭 Mobile-First UI & Centerpiece Navigation](#-mobile-first-ui--centerpiece-navigation)
- [🍿 Theatrical Movies Hub](#-theatrical-movies-hub)
- [⚡ Real-Time Crosswalk Architecture](#-real-time-crosswalk-architecture)
- [📺 Multi-Server Streaming Architecture](#-multi-server-streaming-architecture)
- [💻 Tech Stack](#-tech-stack)
- [🚀 Quickstart & Local Development](#-quickstart--local-development)
- [🌐 Production Deployment Guide](#-production-deployment-guide)
- [📊 Analytics & SEO](#-analytics--seo)
- [📜 License & Credits](#-license--credits)

---

## ✨ Key Features

### 1. 🔗 Semantic SEO Routing & URL Schema
- **Human-Readable Slugs:**
  - Series Info: `/series/:title-season-:seasonNum` (e.g., `/series/solo-leveling-season-1`)
  - Series Episodes: `/watch/:title-:seasonx:episode` (e.g., `/watch/solo-leveling-1x1`, `/watch/solo-leveling-1x2`)
  - Feature Movies: `/movie/:title/:year` & `/watch/:title/:year` (e.g., `/movie/your-name/2016`)
- **Seamless Auto-Upgrade:** Any bookmarked or legacy links using raw IDs (`/series/186541`, `/movie/21519`, `/watch/186541/ep/2`) automatically resolve via AniList GraphQL and upgrade the address bar to the clean canonical slug using `replaceState`.
- **Zero-Latency In-Memory Mapping:** Client-side cache prevents redundant search queries during in-app navigation.

### 2. 📺 Cinema Player & Watch Experience
- **Side-by-Side Desktop Layout:** The video player occupies the left 8 columns, while a scrollable season episode queue is directly accessible in the right 4 columns.
- **Picture-in-Picture (PiP):** Supports native browser Picture-in-Picture mode (`picture-in-picture`, `autoPictureInPicture`) so users can continue watching in a floating window while switching tabs or browsing other sections.
- **Featured Characters & Voice Actors:** Horizontal round-avatar cast strip showcasing characters and their Japanese/English voice actors.
- **Seamless In-Place Episode Switching:** Changing episodes updates video streams and the URL instantly with zero skeleton flash and zero page reloads.
- **Streamlined Navigation & Direct CDN Downloads:** Unified controls for Previous, Next, HD-1 Multi, SUB, DUB, and instant direct downloads.

### 3. 🍱 Compact 3-Column Episode Grid
- **Symmetrical 3-Per-Row Layout:** Normalized episode cards in a clean 3-column grid across mobile, tablet, and desktop viewports.
- **De-cluttered Design:** Removed redundant "Watch" and "Download" buttons on thumbnails for a clean, visual Crunchyroll-style presentation with watched duration badges and progress bars.

### 4. 📱 Installable Progressive Web App (PWA)
- **Standalone Mobile & Desktop App:** Runs in its own distraction-free app window with native status-bar theming and taskbar integration.
- **Smart Install Trigger:** Dynamic "Install App" action integrated right into the top navigation bar (desktop) and mobile drawer menu.
- **Dedicated iOS Safari Guide:** Interactive modal offering visual step-by-step guidance for adding Animora to the home screen on iPhone and iPad.
- **Offline Reliability:** Service worker caching ensures high-speed cold starts and seamless loading even over unstable cellular networks.

### 5. 🎠 Clean Full-Bleed Hero Slider
- **1:1 Native Finger Dragging:** Touch-gesture tracker (`onTouchStart`, `onTouchMove`, `onTouchEnd`) allows users to smoothly swipe back and forth between spotlight banners with real-time feedback and rubber-band elasticity.
- **Pure Full-Bleed Artwork:** Streamlined artwork presentation with cinema gradient fades and unobstructed title typography.
- **Non-Truncated Titles:** Multi-line responsive font scaling ensures long anime titles are fully legible.

### 6. 🧭 Mobile-First UI & Centerpiece Navigation Bar
- **Ergonomic Centerpiece Bottom Navigation:** Positioned the primary **Home** action in the middle (`Browse` | `Movies` | **`Home`** | `Schedule` | `Watchlist`) with an elevated circular highlight and active glow.
- **Single-Line Mobile Card Metadata:** Dynamic season badge (`S1` on mobile, `Season 1` on desktop), `Sub | Dub`, and release year fit strictly on a single line with zero awkward wrapping or truncation.
- **Touch-Optimized Swimlanes:** Wider card rails (`w-[138px] xs:w-40`) showing ~2.2 cards across screen width with native momentum scrolling (`-webkit-overflow-scrolling: touch; overscroll-behavior-x: contain`).

### 7. 🍿 Theatrical Movies Hub
- **Blockbuster Carousel Slider:** Top full-bleed hero banner carousel featuring trending anime feature films (*Suzume*, *Your Name*, *Demon Slayer Mugen Train*, *Jujutsu Kaisen 0*).
- **Home-Style Left-to-Right Scrolling Swimlanes:** Categorized movie sections for **Popular Movies**, **Top Rated Feature Films**, and **Newest Releases** with smooth horizontal flick scrolling, custom badges, and `View All` shortcuts.

### 8. 🎭 Multi-Server Cinema Theater with Orientation Lock
- **Server 1 — `HD-1 (Multi)` (Mirror-Box API):** Multi-source adaptive player featuring HD mirrors (**Abyss**, **FileMoon**, **Vidmoly**, **Streamwish**) mapped via real-time TMDb translation.
- **Server 2 — `SUB` (Megaplay Softsub/Hardsub):** Dedicated original Japanese audio with multilingual subtitles routed directly via AniList ID (`/stream/ani/{id}/{ep}/sub`).
- **Server 3 — `DUB` (Megaplay English Dub):** Direct English audio streaming server via AniList ID (`/stream/ani/{id}/{ep}/dub`).
- **Full Screen & Landscape Lock:** Automatically locks screen orientation to landscape (`screen.orientation.lock('landscape')`) with a universal CSS 90° fallback and floating exit button for iOS Safari.

### 9. ⚡ 100% Real-Time AniList-to-TMDb Crosswalk Engine
- **No Heavy Static Mappings:** Completely eliminates multi-megabyte `mappings.json` or `anime-list-full.json` files.
- **Instant Dual-Tier Translation:** Resolves metadata via [`api.ani.zip`](https://api.ani.zip) and [`arm.haglund.dev`](https://arm.haglund.dev/) on demand.
- **Sub-Millisecond In-Memory Caching:** Subsequent lookups complete in `<0.01ms` from runtime session memory.

### 10. 📅 Live Airing Schedule (AniKoto API)
- **Real-Time Weekly Lineup:** Fetches daily schedules from the AniKoto schedule API (`https://anifetch.code9x-rs.workers.dev/api/anikoto/schedule`) spanning all 7 weekdays (`Mon` - `Sun`).
- **Live Countdown & Broadcast Status:** Shows hours, minutes, and seconds until the next episode airs, plus distinct `AIRED` vs upcoming badges.
- **Audio & Stream Metadata:** Displays `SUB` and `DUB` badge indicators, airing episode numbers, and direct watch links.

---

## 🔗 Semantic URL Routing Architecture

Animora adopts a clean, readable URL structure optimized for search engine indexing and user sharing:

| Page Type | New Semantic URL Pattern | Example URL | Legacy Fallback Support |
| :--- | :--- | :--- | :--- |
| **Series Detail** | `/series/:title-season-:seasonNum` | `/series/solo-leveling-season-1` | `/series/186541` &rarr; Auto-upgrades |
| **Series Playback** | `/watch/:title-:seasonx:episode` | `/watch/solo-leveling-1x2` | `/watch/186541/ep/2` &rarr; Auto-upgrades |
| **Movie Detail** | `/movie/:title/:year` | `/movie/your-name/2016` | `/movie/21519` &rarr; Auto-upgrades |
| **Movie Playback** | `/watch/:title/:year` | `/watch/your-name/2016` | `/watch/21519` &rarr; Auto-upgrades |
| **Catalog Browse** | `/browse?genre=...&format=...` | `/browse?genre=Action&format=TV` | Supported |
| **Movies Hub** | `/movies` | `/movies` | Supported |
| **Anime Schedule**| `/schedule` | `/schedule` (also `/calendar`) | Supported |

---

## 📺 Multi-Server Streaming Architecture

| Server Name | Provider | Protocol / Endpoint Format | Audio / Language | Features |
| :--- | :--- | :--- | :--- | :--- |
| **`HD-1 (Multi)`** | Mirror-Box API | `https://mirrorboxapi.web.app/embed?type=anime&id={tmdbId}&season={season}&episode={ep}` | Multi-Audio / Sub / Dub | Adaptive HLS mirrors (Abyss, FileMoon, Vidmoly), direct CDN downloads |
| **`SUB`** | Megaplay | `https://megaplay.buzz/stream/ani/{anilistId}/{ep}/sub` | Japanese (Original) + Multilingual Subs | Direct AniList ID routing, high-speed edge CDN |
| **`DUB`** | Megaplay | `https://megaplay.buzz/stream/ani/{anilistId}/{ep}/dub` | English Dubbed Audio | Direct AniList ID routing, instant audio swap |

---

## 💻 Tech Stack

### Frontend Client
- **Core Framework:** [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Bundler & Tooling:** [Vite 6](https://vitejs.dev/) with Rollup chunk splitting
- **Styling Engine:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing:** [React Router v7](https://reactrouter.com/) (Browser Mode with semantic slugs and scroll restoration)
- **State Management:** Reactive `useSyncExternalStore` centralized store (`userStore.ts`)
- **Icons:** [Lucide React](https://lucide.dev/) (Tree-shaken into independent vendor chunk)
- **PWA Service Worker:** Vanilla Service Worker with offline caching

### Backend Service (Optional Edge Proxy)
- **Runtime:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Caching:** Memory-bounded LRU cache with in-flight promise deduplication
- **Rate-Limiting:** Request throttling engine with 90 req/min AniList safety buffer

---

## 🚀 Quickstart & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- `npm` v9.0.0 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/code9xrs-hub/animora.git
cd animora
```

### 2. Install Dependencies
```bash
# Install root/server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Start the Development Servers
```bash
# Terminal 1: Start Client (Vite Dev Server on http://localhost:3000)
cd client
npm run dev

# Terminal 2: Start Backend API (Express on http://localhost:5000)
npm run dev
```

---

## 🌐 Production Deployment Guide

### Deploy to Firebase Hosting

Animora is pre-configured for instant zero-configuration deployment to Firebase Hosting:

```bash
# 1. Build the production client
cd client
npm run build
cd ..

# 2. Deploy hosting target
firebase deploy --only hosting
```

The app will be live immediately at `https://animora.web.app/` with full SPA route rewrites configured.

---

## 📊 Analytics & SEO

- **Google Search Console Verified:** Ownership verified with verification token `<meta name="google-site-verification" content="EHH4AOVGq9xwjh5dQkaRKHib-9WzXg2vlzPSSFc1GoU" />`.
- **Google Analytics 4:** Pre-configured with Measurement ID `G-TD4S9HSEG5` in `client/index.html`.
- **XML Sitemap & Robots:** Pre-indexed XML Sitemap (`https://animora.web.app/sitemap.xml`) and search engine crawler instructions (`client/public/robots.txt`).
- **Dynamic Meta Tags & Canonical URLs:** Automated page titles, descriptions, canonical `<link rel="canonical" href="..." />`, and OpenGraph / Twitter Card preview images.
- **Edge-to-Edge Mobile Viewport:** Enhanced viewport with `viewport-fit=cover` for optimal rendering on modern notched smartphones.
- **Schema.org Rich Snippets:** Injected JSON-LD structured data for `WebSite` (with deep `SearchAction`), `TVSeries`, `Movie`, and `TVEpisode`.

---

## 📜 License & Credits

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### Acknowledgments
- **Creator & Developer:** [Rasel Khan](https://github.com/code9xrs-hub) (`code9xrs-hub`)
- **Metadata Provider:** [AniList GraphQL API](https://anilist.co/) — for the comprehensive and open anime catalog.
- **Streaming Engine:** [Mirror-Box API](https://mirrorboxapi.web.app/) — for reliable adaptive multi-server embeds.
- **Secondary Streaming Servers:** [Megaplay](https://megaplay.buzz/) — for high-performance `SUB` and `DUB` streaming servers.
- **Crosswalk Mapping Engines:** [Ani.zip API](https://api.ani.zip) and [Anime Relations Mappings (ARM)](https://arm.haglund.dev/).
- **Design Inspiration:** [Crunchyroll](https://crunchyroll.com/) for cinema dark UI aesthetics.

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/code9xrs-hub">Rasel Khan</a>. If you find this project helpful, please consider starring ⭐ the repository!</sub>
</div>
