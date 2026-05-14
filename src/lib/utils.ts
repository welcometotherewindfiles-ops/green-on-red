// ============================================================
// General utility helpers
// ============================================================
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string into a human-readable format.
 * e.g. "May 22, 2025"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a date + time string.
 * e.g. "May 22, 2025 at 7:00 PM"
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Extracts a YouTube video ID from any standard YouTube URL.
 * Supports watch, short, and embed URL formats.
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

/**
 * Builds a YouTube embed URL from a video ID or full URL.
 */
export function getYouTubeEmbedUrl(urlOrId: string): string | null {
  const id = urlOrId.length === 11 ? urlOrId : extractYouTubeId(urlOrId)
  if (!id) return null
  return `https://www.youtube.com/embed/${id}`
}

/**
 * Truncate a string to a max length, appending ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}
