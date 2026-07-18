import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { createHotelDetail, createHotelPage } from './hotelFixtures'

export const hotelHandlers = {
  listSuccess: http.get('*/api/v1/hotels', ({ request }) => {
    const url = new URL(request.url)
    const city = url.searchParams.get('city')
    const items = city
      ? [
          {
            id: 1,
            name: `${city} Hotel`,
            city,
            address: 'Main st 1',
            description: null,
            stars: 4,
            latitude: '55.75',
            longitude: '37.61',
            created_at: '2026-07-18T10:00:00Z',
            avg_rating: null,
            reviews_count: 0,
            min_price: null,
            cover_image: null,
            is_favorite: null,
          },
        ]
      : createHotelPage().items

    return HttpResponse.json(
      createHotelPage({
        items,
        total: items.length,
        page: Number(url.searchParams.get('page') ?? 1),
        size: Number(url.searchParams.get('size') ?? 20),
      }),
    )
  }),
  listEmpty: http.get('*/api/v1/hotels', () =>
    HttpResponse.json(createHotelPage({ items: [], total: 0 })),
  ),
  listError: http.get('*/api/v1/hotels', () =>
    HttpResponse.json({ detail: 'Server error' }, { status: 500 }),
  ),
  detailSuccess: http.get('*/api/v1/hotels/:hotelId', ({ params }) =>
    HttpResponse.json(
      createHotelDetail({
        id: Number(params.hotelId),
        name: 'Grand Hotel',
        city: 'Moscow',
        description: 'Central hotel',
      }),
    ),
  ),
  detailNotFound: http.get('*/api/v1/hotels/:hotelId', () =>
    HttpResponse.json({ detail: 'Hotel not found' }, { status: 404 }),
  ),
  detailError: http.get('*/api/v1/hotels/:hotelId', () =>
    HttpResponse.json({ detail: 'Server error' }, { status: 500 }),
  ),
}

export const server = setupServer(
  hotelHandlers.listSuccess,
  hotelHandlers.detailSuccess,
)
