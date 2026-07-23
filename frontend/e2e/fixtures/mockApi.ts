import type { Page, Route } from '@playwright/test'

const hotelListItem = {
  id: 1,
  name: 'Grand Hotel',
  city: 'Moscow',
  address: 'Tverskaya 1',
  description: 'Central hotel',
  stars: 5,
  latitude: '55.75',
  longitude: '37.61',
  created_at: '2026-07-18T10:00:00Z',
  avg_rating: 4.7,
  reviews_count: 12,
  min_price: '4500.00',
  cover_image: null as string | null,
  is_favorite: null as boolean | null,
}

const hotelDetail = {
  ...hotelListItem,
  images: [] as string[],
}

const sampleRoom = {
  id: 5,
  hotel_id: 1,
  room_type_id: 1,
  number: '301',
  price: '5500.00',
  capacity: 2,
  description: 'City view',
  status: 'AVAILABLE',
  room_type: { id: 1, name: 'Standard' },
  hotel: { id: 1, name: 'Grand Hotel', city: 'Moscow' },
  images: [] as string[],
}

const json = (route: Route, body: unknown, status = 200): Promise<void> =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })

/** Intercept HBS API so e2e does not depend on docker compose / :8000. */
export const installApiMocks = async (page: Page): Promise<void> => {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const method = request.method()
    const url = new URL(request.url())
    const { pathname, searchParams } = url

    if (method === 'GET' && pathname.endsWith('/hotels/map')) {
      await json(route, {
        items: [
          {
            id: 1,
            name: 'Grand Hotel',
            latitude: '55.7558',
            longitude: '37.6173',
            stars: 5,
            min_price: '4500.00',
            avg_rating: 4.7,
          },
        ],
      })
      return
    }

    const hotelDetailMatch = pathname.match(/\/hotels\/(\d+)(?:\/|$)/)
    if (method === 'GET' && hotelDetailMatch && pathname.includes('/reviews')) {
      await json(route, {
        items: [
          {
            id: 7,
            hotel_id: Number(hotelDetailMatch[1]),
            user_id: 2,
            user_name: 'Guest',
            rating: 5,
            comment: 'Great stay',
            created_at: '2026-07-10T18:00:00Z',
            updated_at: '2026-07-10T18:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        size: 20,
      })
      return
    }

    if (method === 'GET' && hotelDetailMatch && !pathname.endsWith('/hotels')) {
      const id = Number(hotelDetailMatch[1])
      await json(route, {
        ...hotelDetail,
        id,
        name: 'Grand Hotel',
        city: hotelDetail.city,
      })
      return
    }

    if (method === 'GET' && /\/hotels\/?$/.test(pathname)) {
      const city = searchParams.get('city')?.trim()
      const items = city
        ? [{ ...hotelListItem, id: 1, city }]
        : [hotelListItem]
      await json(route, {
        items,
        total: items.length,
        page: Number(searchParams.get('page') ?? 1),
        size: Number(searchParams.get('size') ?? 20),
      })
      return
    }

    if (method === 'GET' && /\/rooms\/?$/.test(pathname)) {
      await json(route, {
        items: [sampleRoom],
        total: 1,
        page: 1,
        size: 50,
      })
      return
    }

    if (method === 'GET' && pathname.includes('/rooms/')) {
      await json(route, sampleRoom)
      return
    }

    // Guest flows should not hit auth; fulfill remaining API with empty/ok stubs.
    if (method === 'GET') {
      await json(route, { items: [], total: 0, page: 1, size: 20 })
      return
    }

    await json(route, { detail: 'mocked' }, 204)
  })
}
