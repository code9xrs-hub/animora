/**
 * High-Resolution Image Utilities
 * Extracts the highest quality poster, banner, and episode thumbnails with robust fallbacks.
 */

export function getHighResPoster(media?: {
  coverImage?: {
    extraLarge?: string | null;
    large?: string | null;
    medium?: string | null;
  } | null;
  bannerImage?: string | null;
}): string {
  if (!media) return '';
  return (
    media.coverImage?.extraLarge ||
    media.coverImage?.large ||
    media.bannerImage ||
    media.coverImage?.medium ||
    ''
  );
}

export function getHighResBanner(media?: {
  bannerImage?: string | null;
  coverImage?: {
    extraLarge?: string | null;
    large?: string | null;
  } | null;
}): string {
  if (!media) return '';
  return (
    media.bannerImage ||
    media.coverImage?.extraLarge ||
    media.coverImage?.large ||
    ''
  );
}

export function getHighResEpisodeThumbnail(
  thumbnailUrl?: string | null,
  bannerImage?: string | null,
  fallbackPoster?: string | null
): string {
  return thumbnailUrl || bannerImage || fallbackPoster || '';
}

