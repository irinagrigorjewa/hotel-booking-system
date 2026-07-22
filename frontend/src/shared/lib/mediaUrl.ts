const DEFAULT_API_BASE = '/api/v1'

const isAbsoluteHttpUrl = (value: string): boolean =>
  /^https?:\/\//i.test(value)

const normalizeMediaPath = (path: string): string =>
  path.startsWith('/') ? path : `/${path}`

/**
 * Resolves API media paths for <img> src.
 * - Relative `/media/...` stays same-origin when API base is relative (Vite/nginx proxy).
 * - Absolute `VITE_API_BASE_URL` → media is served from that backend origin.
 */
export const mediaUrl = (
  path: string | null | undefined,
  apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE,
): string | null => {
  if (path == null) {
    return null
  }

  const trimmed = path.trim()

  if (!trimmed) {
    return null
  }

  if (isAbsoluteHttpUrl(trimmed)) {
    return trimmed
  }

  const mediaPath = normalizeMediaPath(trimmed)

  if (isAbsoluteHttpUrl(apiBaseUrl)) {
    try {
      return `${new URL(apiBaseUrl).origin}${mediaPath}`
    } catch {
      return mediaPath
    }
  }

  return mediaPath
}
