import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  canonical?: string;
  type?: 'website' | 'video.tv_show' | 'video.movie' | 'video.episode' | string;
  ogType?: string;
  schema?: Record<string, any>;
  jsonLd?: Record<string, any>;
  robots?: string;
}

const DEFAULT_TITLE = 'Animora — Stream Popular Anime & Movies Free';
const DEFAULT_DESCRIPTION = 'Stream thousands of trending anime series, simulcasts, and movies in HD with zero-wait direct downloads and multi-server playback powered by AniList & Mirror-Box.';
const DEFAULT_IMAGE = 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg';
const DEFAULT_KEYWORDS = 'anime, stream anime, watch anime online, animora, simulcasts, anime movies, free anime hd, english sub, english dub, anilist, mirrorbox';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url,
  canonical,
  type,
  ogType,
  schema,
  jsonLd,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
}) => {
  const fullTitle = title ? (title.includes('Animora') ? title : `${title} — Animora`) : DEFAULT_TITLE;

  const getOrigin = () => {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin || `${window.location.protocol}//${window.location.host}`;
    }
    return '';
  };

  const resolveFullUrl = (target?: string) => {
    if (!target) return typeof window !== 'undefined' ? window.location.href : '';
    if (target.startsWith('http://') || target.startsWith('https://')) return target;
    const origin = getOrigin();
    return `${origin}${target.startsWith('/') ? '' : '/'}${target}`;
  };

  const currentUrl = resolveFullUrl(canonical || url);
  const activeType = ogType || type || 'website';
  const activeSchema = jsonLd || schema;

  useEffect(() => {
    // 1. Title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMeta = (nameAttr: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${nameAttr}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('name', 'author', 'Animora');
    setMeta('name', 'robots', robots);

    // 3. Open Graph Tags
    setMeta('property', 'og:site_name', 'Animora');
    setMeta('property', 'og:type', activeType);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', currentUrl);

    // 4. Twitter Card Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    // 5. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // 6. JSON-LD Structured Data Schema
    let scriptEl = document.getElementById('animora-jsonld') as HTMLScriptElement | null;
    if (activeSchema) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'animora-jsonld';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(activeSchema);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [fullTitle, description, keywords, image, currentUrl, activeType, activeSchema, robots]);

  return null;
};
