import type { VideoMetadata } from '$lib/types';

const SUPADATA_API_KEY = process.env.SUPADATA_API_KEY;
const SUPADATA_API_URL = 'https://api.supadata.ai/v1/metadata';

/**
 * Fetches video metadata from Supadata API
 * Supports YouTube, TikTok, Instagram, Twitter/X, and Facebook
 */
export async function fetchVideoMetadata(url: string): Promise<VideoMetadata | null> {
  if (!SUPADATA_API_KEY) {
    console.error('SUPADATA_API_KEY not configured');
    return null;
  }

  try {
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`${SUPADATA_API_URL}?url=${encodedUrl}`, {
      method: 'GET',
      headers: {
        'x-api-key': SUPADATA_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Supadata API error:', errorData);
      return null;
    }

    const data = await response.json();
    return data as VideoMetadata;
  } catch (error) {
    console.error('Failed to fetch video metadata:', error);
    return null;
  }
}

/**
 * Formats duration in seconds to human-readable string (e.g., "3:33" or "1:23:45")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats view count to human-readable string (e.g., "1.2M", "456K")
 */
export function formatViewCount(views: number | null): string {
  if (views === null) return 'N/A';
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

/**
 * Formats ISO date string to readable format (e.g., "Oct 24, 2009")
 */
export function formatUploadDate(isoDate: string | null | undefined): string {
  if (!isoDate) return 'Unknown date';

  const date = new Date(isoDate);

  // Check for invalid date
  if (isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
