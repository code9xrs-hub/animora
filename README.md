<div align="center">

# 🎬 Animora — Next-Gen Anime & Movie Streaming Platform

<p align="center">
  <b>A blazing-fast, cinema-grade anime streaming web application & Progressive Web App (PWA).</b><br>
  Powered by React 19, Vite 6, Tailwind CSS v4, AniList GraphQL v2, and real-time multi-server streaming.
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
- 📱 **Progressive Web App (PWA):** 1-click installable app on iOS Safari, Android Chrome, and Desktop Chrome/Edge with standalone window experience and offline fallback.
- 👆 **Real-Time Touch-Scroll Hero Slider:** 1:1 finger tracking, smooth rubber-band dragging, centered navigation controls, and full unclipped title presentation.
- 🧭 **Centerpiece Mobile Bottom Nav:** Ergonomic thumb-friendly navigation bar with prominent center **Home** action (`Browse | Movies | Home | Calendar | Watchlist`).
- 🍿 **Cinematic Movies Hub:** Full-width hero banner carousel and left-to-right horizontal swimlanes for *Popular*, *Top Rated*, and *Newest* feature films.
- 🔍 **Google Search Console & Verified SEO:** Verified Google Search Console ownership, automated `sitemap.xml`, `robots.txt`, and canonical link architecture.
- 📱 **1-Line Mobile Card Metadata:** Smart responsive badges (`S1` on mobile, `Season 1` on desktop, `Sub | Dub`, and release year) guaranteed to fit in one line with zero text wrap.
- 🚀 **Extreme Bundle Optimization:** Route-level code splitting dropping initial JS load to just **~69 KB** (84% reduction!) and sub-second builds (~550ms).
- ⚡ **Zero-Latency Native 60/120Hz Scrolling:** Clean GPU-accelerated scrolling with momentum swipe on mobile swimlanes.
- 🎬 **Multi-Server Cinema Theater:** 3 dedicated servers (HD-1 Multi-Mirror, SUB, DUB) with 1-click landscape rotation lock and feature-policy iframe controls.
- 🔄 **Real-Time Dynamic Crosswalk & Zero-Reload Switcher:** Translates AniList IDs to TMDb/IMDb on the fly via `api.ani.zip` and `arm.haglund.dev`, with in-place episode switches that eliminate full page reloads.
- 🎯 **Smart Auto-Resume & Watch History:** Season-aware resume indicators, progress tracking, and guest-friendly `localStorage` sync.

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [📱 Progressive Web App (PWA) System](#-progressive-web-app-pwa-system)
- [🎠 Next-Gen Touch-Scroll Hero Carousel](#-next-gen-touch-scroll-hero-carousel)
- [🧭 Mobile-First UI & Centerpiece Navigation](#-mobile-first-ui--centerpiece-navigation)
- [🍿 Theatrical Movies Hub & Horizontal Swimlanes](#-theatrical-movies-hub--horizontal-swimlanes)
- [⚡ Real-Time Crosswalk Architecture](#-real-time-crosswalk-architecture)
- [📺 Multi-Server Streaming Architecture](#-multi-server-streaming-architecture)
- [🏗️ System Architecture](#️-system-architecture)
- [💻 Tech Stack](#-tech-stack)
- [📁 Repository Structure](#-repository-structure)
- [🚀 Quickstart & Local Development](#-quickstart--local-development)
- [🌐 Production Deployment Guide](#-production-deployment-guide)
- [📊 Analytics & SEO](#-analytics--seo)
- [📜 License & Credits](#-license--credits)

---

## ✨ Key Features

### 1. 📱 Installable Progressive Web App (PWA)
- **Standalone Mobile & Desktop App:** Runs in its own distraction-free app window with native status-bar theming and taskbar integration.
- **Smart Install Trigger:** Dynamic "Install App" action integrated right into the top navigation bar (desktop) and mobile drawer menu.
- **Dedicated iOS Safari Guide:** Interactive modal offering visual step-by-step guidance for adding Animora to the home screen on iPhone and iPad.
- **Offline Reliability:** Service worker caching ensures high-speed cold starts and seamless loading even over unstable cellular networks.

### 2. 🎠 Real-Time Touch-Scroll Hero Slider
- **1:1 Native Finger Dragging:** Touch-gesture tracker (`onTouchStart`, `onTouchMove`, `onTouchEnd`) allows users to smoothly swipe back and forth between spotlight banners with real-time feedback and rubber-band elasticity.
- **Responsive Aspect Ratio:** Proportional auto-resizing across all devices (`h-[330px]` on mobile up to `600px` on ultra-wide desktop) showing 100% of the anime art without awkward crops.
- **Full Anime Titles:** Non-truncated, multi-line titles allow users to read long anime names effortlessly.
- **De-cluttered Interface:** Centered tactile navigation arrows with subtle hover lifts; clean progress indicator dots positioned with safe touch padding.
- **Optimized Timer Loop:** Pure CSS keyframes eliminate interval-driven layout thrashing.

### 3. 🧭 Mobile-First UI & Centerpiece Navigation Bar
- **Ergonomic Centerpiece Bottom Navigation:** Positioned the primary **Home** action in the middle (`Browse` | `Movies` | **`Home`** | `Calendar` | `Watchlist`) with an elevated circular highlight and active glow.
- **Single-Line Mobile Card Metadata:** Dynamic season badge (`S1` on mobile, `Season 1` on desktop), `Sub | Dub`, and release year fit strictly on a single line with zero awkward wrapping or truncation.
- **Touch-Optimized Swimlanes:** Wider card rails (`w-[138px] xs:w-40`) showing ~2.2 cards across screen width with native momentum scrolling (`-webkit-overflow-scrolling: touch; overscroll-behavior-x: contain`).

### 4. 🍿 Theatrical Movies Hub & Horizontal Swimlanes
- **Blockbuster Carousel Slider:** Top full-bleed hero banner carousel featuring trending anime feature films (*Suzume*, *Your Name*, *Demon Slayer Mugen Train*, *Jujutsu Kaisen 0*).
- **Home-Style Left-to-Right Scrolling Swimlanes:** Categorized movie sections for **Popular Movies**, **Top Rated Feature Films**, and **Newest Releases** with smooth horizontal flick scrolling, custom badges, and `View All` shortcuts.

### 5. ⚡ Sub-Second Performance & Code Splitting
- **~69 KB Initial Bundle:** Using `React.lazy()` and `Suspense`, only the active route's JavaScript is loaded upfront.
- **Zero Input Lag:** Removed third-party scroll hijackers in favor of native GPU 60/120Hz hardware acceleration.
- **Zero Layout Shift (CLS < 0.01):** Content-aware skeleton shimmer system maintains exact component dimensions before data arrives.

### 6. 🎭 Multi-Server Cinema Theater with Orientation Lock
- **Server 1 — `HD-1 (Multi)` (Mirror-Box API):** Multi-source adaptive player featuring HD mirrors (**Abyss**, **FileMoon**, **Vidmoly**, **Streamwish**) mapped via real-time TMDb translation.
- **Server 2 — `SUB` (Megaplay Softsub/Hardsub):** Dedicated original Japanese audio with multilingual subtitles routed directly via AniList ID (`/stream/ani/{id}/{ep}/sub`).
- **Server 3 — `DUB` (Megaplay English Dub):** Direct English audio streaming server via AniList ID (`/stream/ani/{id}/{ep}/dub`).
- **Full Screen & Landscape Lock:** Automatically locks screen orientation to landscape (`screen.orientation.lock('landscape')`) with a universal CSS 90° fallback and floating exit button for iOS Safari.
- **Zero-Reload Episode Switching:** Seamless in-place episode switches without re-fetching anime details or showing skeleton flashes.
- **Direct CDN Downloads:** Clean, single direct download button for instant offline storage.

### 7. ⚡ 100% Real-Time AniList-to-TMDb Crosswalk Engine
- **No Heavy Static Mappings:** Completely eliminates multi-megabyte `mappings.json` or `anime-list-full.json` files.
- **Instant Dual-Tier Translation:** Resolves metadata via [`api.ani.zip`](https://api.ani.zip) and [`arm.haglund.dev`](https://arm.haglund.dev/) on demand.
- **Sub-Millisecond In-Memory Caching:** Subsequent lookups complete in `<0.01ms` from runtime session memory.

### 8. 🔄 Season-Aware "Continue Watching" & Auto-Resume
- **Deep Episode & Season Tracking:** Keeps track of exact season numbers and episode numbers.
- **Smart CTA Buttons:** Dynamic action buttons change to `CONTINUE S<season> E<ep>` (or `Resume Ep <ep>`).
- **Visual Progress Badges:** Visual "Last Played" chips and progress indicators across all swimlanes.

### 9. 📅 Live Simulcast Airing Calendar
- **3-Column Schedule Grid:** Clean, structured card layout showing upcoming simulcast broadcasts.
- **Real-Time Countdown:** Live ticking countdown showing hours, minutes, and seconds until the next episode broadcasts in Japan.
- **Timezone Synchronization:** Automatically converts broadcast schedules to the viewer's local browser timezone.

---

## 📱 Progressive Web App (PWA) System

Animora is built from the ground up as a production-grade Progressive Web App:

```
[ Browser Visit: animora.web.app ]
               │
               ▼
   ┌───────────────────────┐
   │ Service Worker (sw.js)│ ◄─── Pre-caches offline shell & brand assets
   └───────────┬───────────┘
               │
     ┌─────────┴─────────┐
     ▼                   ▼
[ Desktop / Android ]  [ iOS Safari / iPadOS ]
  Native Install API     Custom "Add to Home Screen"
  Prompt in Navbar       Visual Walkthrough Modal
     │                   │
     └─────────┬─────────┘
               ▼
    ┌─────────────────────────┐
    │ Standalone App Window   │
    │ • Fullscreen immersion  │
    │ • Zero address-bar lag  │
    │ • App switcher icon     │
    └─────────────────────────┘
```

---

## 🎠 Next-Gen Touch-Scroll Hero Carousel

| Feature | Legacy Implementation | Animora Next-Gen Implementation |
| :--- | :--- | :--- |
| **Mobile Interaction** | Click-only / static taps | **1:1 Real-time touch drag** with rubber-banding and velocity snapping |
| **Art Display** | Fixed-height crop (edges lost) | **Proportional multi-breakpoint aspect ratio** showing full artwork |
| **Title Typography** | Truncated (`line-clamp-1` / `2`) | **Full multi-line title** with responsive font scaling |
| **Animation Loop** | 50ms `setInterval` state re-render | **Hardware-accelerated CSS keyframes** with zero React thrash |
| **Mobile Cleanliness** | Dots & counters covering art | **Clean, uncluttered view**; centered navigation arrows |

---

## ⚡ Real-Time Crosswalk Architecture

```
               [ User Clicks Episode / Show ]
                             │
                             ▼
              ┌──────────────────────────────┐
              │ In-Memory Session Cache Hit? │
              └──────┬────────────────┬──────┘
                     │ YES            │ NO
                     ▼                ▼
          [ Instant Return (<0.01ms) ] [ Real-Time Multi-Tier Crosswalk Query ]
                                                    │
                                                    ├─► Tier 1: api.ani.zip/mappings?anilist_id={id}
                                                    │   (Primary: returns TMDb ID & IMDb ID)
                                                    │
                                                    └─► Tier 2: arm.haglund.dev/api/v2/ids?source=anilist&id={id}
                                                        (Fallback: returns TMDb ID, Season & Ep offset)
                                                    │
                                                    ▼
                                       [ Cache in Session Memory ]
                                                    │
                                                    ▼
                                       [ Stream Generated Instantly ]
```

---

## 📺 Multi-Server Streaming Architecture

| Server Name | Provider | Protocol / Endpoint Format | Audio / Language | Features |
| :--- | :--- | :--- | :--- | :--- |
| **`HD-1 (Multi)`** | Mirror-Box API | `https://mirrorboxapi.web.app/embed?type=anime&id={tmdbId}&season={season}&episode={ep}` | Multi-Audio / Sub / Dub | Adaptive HLS mirrors (Abyss, FileMoon, Vidmoly), direct CDN downloads |
| **`SUB`** | Megaplay | `https://megaplay.buzz/stream/ani/{anilistId}/{ep}/sub` | Japanese (Original) + Multilingual Subs | Direct AniList ID routing, high-speed edge CDN |
| **`DUB`** | Megaplay | `https://megaplay.buzz/stream/ani/{anilistId}/{ep}/dub` | English Dubbed Audio | Direct AniList ID routing, instant audio swap |

---

## 🏗️ System Architecture

```
                      +------------------------------------------+
                      |         Animora PWA & Client App         |
                      |   React 19 + TypeScript + Vite + SW      |
                      +--------------------+---------------------+
                                           |
                 +-------------------------+-------------------------+
                 |                                                   |
    [Production / Serverless SPA]                             [Localhost / BFF]
                 |                                                   |
                 v                                                   v
   +---------------------------+                       +---------------------------+
   |   clientAniList.ts        |                       |   Express Backend (BFF)   |
   |   crosswalkResolver.ts    |                       |   fribb.service.js        |
   | (Browser Real-Time Engine)|                       | (Backend Real-Time Engine)|
   +-------------+-------------+                       +-------------+-------------+
                 |                                                   |
                 +-------------------------+-------------------------+
                                           |
        +----------------------------------+----------------------------------+
        |                                  |                                  |
        v                                  v                                  v
+─────────────────+             +───────────────────────+          +───────────────────────+
| AniList GraphQL |             | Real-Time Crosswalk   |          | Streaming Providers   |
|   Metadata v2   |             | (ani.zip & arm.haglund|          | • Mirror-Box (HD-1)   |
| (graphql.anilist)             |  Live ID Conversion)  |          | • Megaplay (SUB/DUB)  |
+─────────────────+             +───────────────────────+          +───────────────────────+
```

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| **Bundler & Tooling** | [Vite 6](https://vitejs.dev/) with `manualChunks` route-level code splitting |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom Cinema Dark Palette |
| **Application Capabilities** | Progressive Web App (PWA), Service Worker, Web App Manifest |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **Backend / BFF** | [Node.js](https://nodejs.org/) + [Express 4](https://expressjs.com/) |
| **Metadata Engine** | [AniList GraphQL API v2](https://docs.anilist.co/) |
| **Crosswalk Engines** | [Ani.zip API](https://api.ani.zip) + [Anime Relations Mappings (ARM)](https://arm.haglund.dev/) |
| **Streaming Engines** | [Mirror-Box API](https://mirrorboxapi.web.app/) + [Megaplay API](https://megaplay.buzz/) |
| **Analytics** | Google Analytics 4 (`gtag.js` - `G-TD4S9HSEG5`) |
| **Hosting Targets** | [Firebase Hosting](https://firebase.google.com/docs/hosting) (`animora`), [Vercel](https://vercel.com/), or Docker |

---

## 📁 Repository Structure

```text
anime/
├── client/                     # Frontend Progressive Web Application (SPA/PWA)
│   ├── public/                 # Static public assets
│   │   ├── icons/              # PWA app icons (192x192, 512x512, maskable)
│   │   ├── favicon.svg         # Official Animora branded SVG favicon
│   │   ├── manifest.json       # Web App Manifest for PWA installation
│   │   ├── robots.txt          # Search engine crawler directives
│   │   ├── sitemap.xml         # XML Sitemap for search engines
│   │   └── sw.js               # Service Worker for offline shell caching
│   ├── src/
│   │   ├── api/                # Hybrid API clients & real-time ID crosswalk resolver
│   │   │   ├── animeApi.ts         # Primary API consumer
│   │   │   ├── clientAniList.ts    # Browser-direct AniList GraphQL fallback service
│   │   │   └── crosswalkResolver.ts# Real-time AniList->TMDb resolver & stream builder
│   │   ├── components/         # Reusable design system components
│   │   │   ├── cards/          # Anime poster & horizontal episode cards with CDN download
│   │   │   ├── common/         # SEO manager, Shimmer skeletons, PWA Install Modal
│   │   │   ├── home/           # Real-time touch-scroll Hero Banner Carousel
│   │   │   ├── layout/         # Header, Footer, Mobile Drawer Navigation
│   │   │   └── player/         # Cinema theater player with Multi-Server Switcher
│   │   ├── hooks/              # Custom React hooks (usePWAInstall, useWatchHistory)
│   │   ├── pages/              # Lazy-loaded routed pages (Home, Browse, Watch, Calendar, Detail)
│   │   ├── types/              # Comprehensive TypeScript interfaces & DTOs
│   │   ├── App.tsx             # Root router with Suspense fallback
│   │   ├── index.css           # Global typography & Tailwind styling
│   │   └── main.tsx            # React application entry & SW registration
│   ├── index.html              # HTML5 template with SEO, PWA meta & Google Analytics (GA4)
│   ├── package.json            # Client dependencies
│   ├── tsconfig.json           # TypeScript configuration
│   └── vite.config.ts          # Vite build pipeline with optimized code splitting
├── server/                     # Optional Node.js BFF (Backend-for-Frontend)
│   ├── src/
│   │   ├── anilist.service.js  # AniList GraphQL query engine & rate-limiter
│   │   ├── fribb.service.js    # Real-time backend crosswalk resolver & cache
│   │   └── index.js            # Express API server with async stream injection
│   └── package.json            # Server dependencies
├── .firebaserc                 # Firebase project configuration (site: animora)
├── firebase.json               # Firebase Hosting SPA rewrite rules
├── start.js                    # Concurrent development launcher
├── LICENSE                     # MIT License
└── README.md                   # Project documentation
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/code9xrs-hub/animora.git
cd animora
```

### 2. Install Dependencies
```bash
# Install root launcher dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### 3. Launch Development Environment
Run both the Node.js backend (`http://localhost:5000`) and the Vite frontend (`http://localhost:3000`) concurrently with a single command:

```bash
node start.js
# or
npm start
```

Open your browser and navigate to **`http://localhost:3000`**.

---

## 🌐 Production Deployment Guide

### 1. Firebase Hosting (Recommended)

The project includes pre-configured [`.firebaserc`](file:///.firebaserc) and [`firebase.json`](file:///firebase.json) files configured for the `animora` site target.

1. **Install Firebase CLI (if not already installed):**
   ```bash
   npm install -g firebase-tools
   ```

2. **Authenticate with Firebase:**
   ```bash
   firebase login
   ```

3. **Build the Production Client Bundle:**
   ```bash
   cd client
   npm run build
   cd ..
   ```

4. **Deploy to Firebase Hosting:**
   ```bash
   firebase deploy --only hosting:animora
   ```

Your live site will be instantly available at:  
👉 **[https://animora.web.app/](https://animora.web.app/)**

---

### 2. Vercel / Netlify Deployment

Since Animora possesses an integrated browser-direct AniList fallback and client-side crosswalk resolver, it can be deployed directly as a pure static SPA on Vercel or Netlify without requiring a Node server:

1. Connect your repository to Vercel/Netlify.
2. Set build configuration:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Configure SPA rewrites to `/index.html`.

---

## 📊 Analytics & SEO

- **Google Search Console Verified:** Ownership verified with verification token `<meta name="google-site-verification" content="EHH4AOVGq9xwjh5dQkaRKHib-9WzXg2vlzPSSFc1GoU" />`.
- **Google Analytics 4:** Pre-configured with Measurement ID `G-TD4S9HSEG5` in `client/index.html`.
- **XML Sitemap & Robots:** Pre-indexed XML Sitemap (`https://animora.web.app/sitemap.xml`) and search engine crawler instructions (`client/public/robots.txt`).
- **Dynamic Meta Tags & Canonical URLs:** Automated page titles, descriptions, canonical `<link rel="canonical" href="..." />`, and OpenGraph / Twitter Card preview images.
- **Edge-to-Edge Mobile Viewport:** Enhanced viewport with `viewport-fit=cover` for optimal rendering on modern notched smartphones.
- **Schema.org Rich Snippets:** Injected JSON-LD structured data for `WebSite` (with deep `SearchAction`), `TVSeries`, `Movie`, and `TVEpisode`.
- **Domain Auto-Resolution:** Automatically adapts metadata and OpenGraph URLs to any custom domain without hardcoding.

---

## 📜 License & Credits

This project is licensed under the **MIT License** — see the [LICENSE](file:///LICENSE) file for details.

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
