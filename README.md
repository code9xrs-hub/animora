<div align="center">

# 🎬 Animora — Next-Gen Anime & Movie Streaming Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.x-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase Hosting](https://img.shields.io/badge/Firebase-Hosting-FFCA28?logo=firebase)](https://firebase.google.com/)
[![AniList API](https://img.shields.io/badge/Metadata-AniList_GraphQL_v2-02A9FF?logo=anilist)](https://anilist.co/)
[![Lenis Scroll](https://img.shields.io/badge/Scroll-Lenis_Smooth-black)](https://lenis.darkroom.engineering/)

**Animora** is a state-of-the-art, open-source anime streaming platform engineered with a cinema-grade dark UI/UX inspired by Crunchyroll. It pairs the extensive metadata catalog of **AniList GraphQL v2** with the high-speed multi-server streaming and direct CDN download pipeline of the **Mirror-Box API**, harmonized via deterministic crosswalk ID resolution.

🌐 **Live Demo:** [https://animora-b3477.web.app](https://animora-b3477.web.app)  
📦 **GitHub Repository:** [code9xrs-hub/animora](https://github.com/code9xrs-hub)  
👤 **Author & Creator:** [Rasel Khan](https://github.com/code9xrs-hub) (`code9xrs-hub`)

---

</div>

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [🏗️ Architectural Overview](#️-architectural-overview)
- [💻 Tech Stack](#-tech-stack)
- [📁 Repository Structure](#-repository-structure)
- [🚀 Local Development Setup](#-local-development-setup)
- [🌐 Production Deployment Guide](#-production-deployment-guide)
  - [Firebase Hosting Deployment](#1-firebase-hosting-recommended)
  - [Vercel / Netlify Deployment](#2-vercel--netlify-deployment)
  - [Self-Hosted VPS / Docker Deployment](#3-self-hosted-vps-or-docker-deployment)
- [📊 Analytics & SEO Configuration](#-analytics--seo-configuration)
- [📜 License](#-license)
- [💖 Credits & Acknowledgments](#-credits--acknowledgments)

---

## ✨ Key Features

### 1. 🎭 Theater Experience & Multi-Server Video Player
- **Mirror-Box Cinema Player:** Seamless adaptive iframe playback supporting multiple premium servers (**Abyss**, **FileMoon**, **Vidmoly**, **Streamwish**, and more).
- **Zero-Wait Direct CDN Downloads:** Download episodes and movies in full quality with single-click direct links.
- **Cinema Mode:** Dedicated "Lights Off" mode, expanded wide theater view, and auto-scrolling to player viewport.
- **Binge Navigation:** Fluid Previous and Next episode triggers with instant stream swapping without page reloads.

### 2. 📅 Live Simulcast Airing Calendar
- **Real-Time Countdown with Seconds:** Dynamic ticking countdown displaying exact hours, minutes, and seconds until upcoming episodes broadcast live in Japan.
- **Weekly Schedule:** Day-by-day airing timeline synchronized with AniList and converted to the user's local browser timezone.

### 3. 📚 True Season & Episode Hierarchy
- **Strict AniList Alignment:** TV Series and multi-cour franchises display accurate season counts and episode numbers according to official AniList production records.
- **Movie Differentiation:** Anime movies feature clean presentation without redundant season or episode dropdowns.

### 4. 🌊 Ultra-Smooth Inertia Physics with Lenis
- **Lenis Smooth Scroll:** Global hardware-accelerated inertia scrolling enabled across all desktop and mobile devices via [@studio-freight/lenis](https://lenis.darkroom.engineering/).

### 5. 🔍 Faceted Search & Advanced Exploration
- **Real-Time Dynamic Filters:** Explore tens of thousands of anime titles by genre, season (Winter, Spring, Summer, Fall), release year, format (TV, Movie, OVA, ONA), broadcasting status, and sorting order.
- **Instant Search Modal:** Header quick-search with debounced AniList queries, instant cover thumbnails, and keyboard accessibility.

### 6. 📱 Responsive Mobile First UI
- Optimized typography, touch-friendly tap targets, swipeable horizontal rail carousels, and responsive layouts crafted for modern iOS Safari, Android Chrome, tablets, and 4K displays.

### 7. 🔖 Local & Cloud Watchlist & History
- Persistent storage for Saved Watchlist and Watch History with local fallback (`localStorage`), allowing full offline guest support and instant multi-device syncing.

### 8. 🎯 Production-Grade SEO & Structured Data
- **Dynamic Meta Tags:** Automated page titles, descriptions, canonical URLs, and OpenGraph/Twitter card images.
- **Schema.org Rich Snippets:** Injected JSON-LD structured data for `WebSite` (with deep `SearchAction`), `TVSeries`, `Movie`, and `TVEpisode`.
- **Domain Auto-Resolution:** Automatically adapts metadata and OpenGraph URLs to any custom domain or hosting host without hardcoded domains.

---

## 🏗️ Architectural Overview

```
                      +------------------------------------------+
                      |               Client App                 |
                      |   React 19 + TypeScript + Vite + Lenis   |
                      +--------------------+---------------------+
                                           |
                +--------------------------+--------------------------+
                |                                                     |
    [In Production / Serverless]                               [In Localhost / BFF]
                |                                                     |
                v                                                     v
   +--------------------------+                         +--------------------------+
   |   clientAniList.ts       |                         |  Express Backend (BFF)   |
   | Direct GraphQL Fallback  |                         |  In-Memory LRU Cache     |
   +------------+-------------+                         +------------+-------------+
                |                                                    |
                +--------------------------+-------------------------+
                                           |
                 +-------------------------+-------------------------+
                 |                                                   |
                 v                                                   v
     +-----------------------+                           +-----------------------+
     |   AniList GraphQL v2  |                           |     Mirror-Box API    |
     |   Metadata & Schedules|                           | Multi-Server Streams  |
     | (graphql.anilist.co)  |                           | & Direct CDN Downloads|
     +-----------------------+                           +-----------------------+
```

### Hybrid Standalone Architecture:
1. **Local Mode (Node.js BFF):** Runs an Express server on port `5000` with in-memory caching and request throttling to minimize rate limits against AniList.
2. **Serverless Cloud Mode (Firebase / Vercel):** If deployed without a separate Node.js server, the client API automatically falls back to client-side AniList GraphQL v2 and Mirror-Box endpoints. No separate backend hosting is required!

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| **Bundler & Dev Server** | [Vite 6](https://vitejs.dev/) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom Crunchyroll Dark Palette |
| **Smooth Scrolling** | [Lenis](https://lenis.darkroom.engineering/) (`lenis`) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **Backend / BFF** | [Node.js](https://nodejs.org/) + [Express 4](https://expressjs.com/) |
| **Metadata Engine** | [AniList GraphQL API v2](https://docs.anilist.co/) |
| **Streaming Engine** | [Mirror-Box API](https://mirrorboxapi.web.app/) |
| **Analytics** | Google Analytics 4 (`gtag.js`) |
| **Deployment Target** | [Firebase Hosting](https://firebase.google.com/docs/hosting), [Vercel](https://vercel.com/), or Docker VPS |

---

## 📁 Repository Structure

```text
anime/
├── client/                     # Frontend Single Page Application (SPA)
│   ├── public/                 # Static assets & public media
│   ├── src/
│   │   ├── api/                # API client with hybrid server & direct GraphQL fallback
│   │   │   ├── animeApi.ts     # Primary API consumer
│   │   │   └── clientAniList.ts# Browser-direct AniList GraphQL fallback service
│   │   ├── components/         # Reusable design system components
│   │   │   ├── cards/          # Anime poster & horizontal cards
│   │   │   ├── carousel/       # Hero spotlight carousel
│   │   │   ├── common/         # SEO manager, Error boundaries, Loaders
│   │   │   ├── layout/         # Header, Footer, Navigation
│   │   │   └── player/         # MirrorBox cinema theater player
│   │   ├── pages/              # Routed pages (Home, Browse, Watch, Calendar, Detail)
│   │   ├── types/              # Comprehensive TypeScript interfaces & DTOs
│   │   ├── App.tsx             # Root router & Lenis initialization
│   │   ├── index.css           # Global typography & Tailwind styling
│   │   └── main.tsx            # React application entry
│   ├── index.html              # HTML5 template with SEO & Google Analytics
│   ├── package.json            # Client dependencies
│   ├── tailwind.config.js      # Design tokens
│   ├── tsconfig.json           # TypeScript configuration
│   └── vite.config.ts          # Vite build pipeline
├── server/                     # Optional Node.js BFF (Backend-for-Frontend)
│   ├── src/
│   │   ├── anilist.service.js  # AniList GraphQL query engine & rate-limiter
│   │   ├── fribb.service.js    # TMDb/IMDb crosswalk mapper
│   │   └── index.js            # Express API server
│   └── package.json            # Server dependencies
├── .firebaserc                 # Firebase project configuration (animora-b3477)
├── firebase.json               # Firebase Hosting rewrite rules
├── start.js                    # Concurrent development launcher
├── detaill.prd                 # Product Requirements Document
├── LICENSE                     # MIT License
└── README.md                   # Project documentation
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (bundled with Node.js)

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
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Launch Development Environment
You can run both the Node.js backend (`http://localhost:5000`) and the Vite frontend (`http://localhost:3000`) concurrently with a single command:

```bash
node start.js
# or
npm start
```

Open your browser and navigate to **`http://localhost:3000`**.

---

## 🌐 Production Deployment Guide

### 1. Firebase Hosting (Recommended)

The project includes pre-configured [`.firebaserc`](file:///.firebaserc) and [`firebase.json`](file:///firebase.json) files for seamless deployment.

1. **Install Firebase CLI globally (if not already installed):**
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
   firebase deploy --only hosting
   ```

Your live site will be ready at:  
👉 **`https://<your-project-id>.web.app`** (e.g., `https://animora-b3477.web.app`)

---

### 2. Vercel / Netlify Deployment

Since the client has an integrated client-side AniList fallback, it can be deployed directly as a pure static/SPA site on Vercel or Netlify:

1. Connect your GitHub repository to Vercel/Netlify.
2. Configure build settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add a single-page app rewrite rule (e.g. `vercel.json`):
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

---

### 3. Self-Hosted VPS or Docker Deployment

To run both the Express backend proxy and static frontend on your own server (Ubuntu / Debian / Nginx):

```bash
# 1. Build the frontend
cd client && npm run build && cd ..

# 2. Serve backend with PM2
npm install -g pm2
pm2 start server/src/index.js --name "animora-bff"

# 3. Use Nginx or Caddy to serve client/dist and proxy /api to localhost:5000
```

---

## 📊 Analytics & SEO Configuration

### Google Analytics 4
The platform includes built-in GA4 tracking via `gtag.js`. To use your own tracking ID:
1. Open [`client/index.html`](file:///client/index.html).
2. Replace `G-TD4S9HSEG5` with your Google Analytics Measurement ID:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_MEASUREMENT_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'YOUR_MEASUREMENT_ID');
   </script>
   ```

### SEO & OpenGraph Meta
All OpenGraph tags, canonical links, and Schema.org structured data automatically adapt to whatever domain your app is accessed from via `window.location.origin`. No domain editing is necessary when switching custom domains.

---

## 📜 License

This project is licensed under the **MIT License**.  
See the [`LICENSE`](file:///LICENSE) file for full details.

```text
MIT License

Copyright (c) 2026 Rasel Khan (code9xrs-hub)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 💖 Credits & Acknowledgments

- **Creator & Developer:** **Rasel Khan**  
  GitHub: [@code9xrs-hub](https://github.com/code9xrs-hub)
- **Metadata Provider:** [AniList GraphQL API](https://anilist.co/) — for free and open anime metadata access.
- **Streaming Provider:** [Mirror-Box API](https://mirrorboxapi.web.app/) — for reliable adaptive multi-server embeds.
- **Dataset Crosswalk:** [Fribb Anime-Lists](https://github.com/Fribb/anime-lists) — for AniList-to-TMDb/IMDb ID cross-referencing.
- **Smooth Scrolling:** [Studio Freight Lenis](https://lenis.darkroom.engineering/).
- **Design Inspiration:** [Crunchyroll](https://crunchyroll.com/) for UI aesthetic inspiration.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/code9xrs-hub">Rasel Khan</a>. If you find this project helpful, please consider starring ⭐ the repository!</sub>
</div>
