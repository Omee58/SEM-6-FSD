/**
 * Returns a usable image URL.
 * - Cloudinary URLs (https://...) are returned as-is.
 * - Legacy local paths (/uploads/...) are prefixed with the API base URL.
 * - Empty/null returns null.
 */
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

export function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}
