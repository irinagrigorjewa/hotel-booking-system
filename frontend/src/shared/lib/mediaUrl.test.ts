import { describe, expect, it } from 'vitest'

import { mediaUrl } from './mediaUrl'

describe('mediaUrl', () => {
  it('returns null for null or empty path', () => {
    expect(mediaUrl(null)).toBeNull()
    expect(mediaUrl(undefined)).toBeNull()
    expect(mediaUrl('')).toBeNull()
    expect(mediaUrl('   ')).toBeNull()
  })

  it('passes through absolute http(s) URLs', () => {
    expect(mediaUrl('https://cdn.example/hotels/1.jpg')).toBe(
      'https://cdn.example/hotels/1.jpg',
    )
    expect(mediaUrl('http://localhost:8000/media/hotels/1/a.webp')).toBe(
      'http://localhost:8000/media/hotels/1/a.webp',
    )
  })

  it('keeps relative /media path when API base is same-origin', () => {
    expect(mediaUrl('/media/hotels/1/cover.webp', '/api/v1')).toBe(
      '/media/hotels/1/cover.webp',
    )
    expect(mediaUrl('media/hotels/1/cover.webp', '/api/v1')).toBe(
      '/media/hotels/1/cover.webp',
    )
  })

  it('builds absolute media URL from absolute VITE_API_BASE_URL origin', () => {
    expect(
      mediaUrl(
        '/media/hotels/1/cover.webp',
        'http://localhost:8000/api/v1',
      ),
    ).toBe('http://localhost:8000/media/hotels/1/cover.webp')

    expect(
      mediaUrl(
        '/media/hotels/2/a.webp',
        'https://api.example.com/api/v1',
      ),
    ).toBe('https://api.example.com/media/hotels/2/a.webp')
  })
})
