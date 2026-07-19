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
  createSuccess: http.post('*/api/v1/hotels', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>

    return HttpResponse.json(
      createHotelDetail({
        id: 2,
        name: String(body.name ?? 'New Hotel'),
        city: String(body.city ?? 'Moscow'),
        address: String(body.address ?? 'Address'),
        stars: Number(body.stars ?? 3),
        latitude: String(body.latitude ?? '55.75'),
        longitude: String(body.longitude ?? '37.61'),
      }),
      { status: 201 },
    )
  }),
  updateSuccess: http.put('*/api/v1/hotels/:hotelId', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>

    return HttpResponse.json(
      createHotelDetail({
        id: Number(params.hotelId),
        name: String(body.name ?? 'Updated Hotel'),
        city: String(body.city ?? 'Moscow'),
        address: String(body.address ?? 'Address'),
        stars: Number(body.stars ?? 3),
        latitude: String(body.latitude ?? '55.75'),
        longitude: String(body.longitude ?? '37.61'),
      }),
    )
  }),
  deleteSuccess: http.delete('*/api/v1/hotels/:hotelId', () =>
    new HttpResponse(null, { status: 204 }),
  ),
}

export const roomTypeHandlers = {
  listSuccess: http.get('*/api/v1/room-types', () =>
    HttpResponse.json({
      items: [{ id: 1, name: 'Standard' }],
      total: 1,
      page: 1,
      size: 100,
    }),
  ),
  listEmpty: http.get('*/api/v1/room-types', () =>
    HttpResponse.json({ items: [], total: 0, page: 1, size: 100 }),
  ),
  createSuccess: http.post('*/api/v1/room-types', async ({ request }) => {
    const body = (await request.json()) as { name?: string }

    return HttpResponse.json(
      { id: 2, name: body.name ?? 'Deluxe' },
      { status: 201 },
    )
  }),
  createConflict: http.post('*/api/v1/room-types', () =>
    HttpResponse.json(
      { detail: 'Room type already exists' },
      { status: 409 },
    ),
  ),
  updateSuccess: http.put('*/api/v1/room-types/:roomTypeId', async ({ params, request }) => {
    const body = (await request.json()) as { name?: string }

    return HttpResponse.json({
      id: Number(params.roomTypeId),
      name: body.name ?? 'Updated',
    })
  }),
  deleteSuccess: http.delete('*/api/v1/room-types/:roomTypeId', () =>
    new HttpResponse(null, { status: 204 }),
  ),
}

const sampleRoom = {
  id: 5,
  hotel_id: 1,
  room_type_id: 1,
  number: '301',
  price: '5500.00',
  capacity: 2,
  description: 'City view',
  status: 'AVAILABLE' as const,
  room_type: { id: 1, name: 'Standard' },
  hotel: { id: 1, name: 'Grand Hotel', city: 'Moscow' },
  images: [],
}

export const roomHandlers = {
  listSuccess: http.get('*/api/v1/rooms', () =>
    HttpResponse.json({
      items: [sampleRoom],
      total: 1,
      page: 1,
      size: 50,
    }),
  ),
  listEmpty: http.get('*/api/v1/rooms', () =>
    HttpResponse.json({ items: [], total: 0, page: 1, size: 50 }),
  ),
  createSuccess: http.post('*/api/v1/rooms', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>

    return HttpResponse.json(
      {
        ...sampleRoom,
        id: 6,
        number: String(body.number ?? '302'),
        price: String(body.price ?? '5500.00'),
        capacity: Number(body.capacity ?? 2),
        status: String(body.status ?? 'AVAILABLE'),
      },
      { status: 201 },
    )
  }),
  createConflict: http.post('*/api/v1/rooms', () =>
    HttpResponse.json(
      { detail: 'Room number already exists' },
      { status: 409 },
    ),
  ),
  updateSuccess: http.put('*/api/v1/rooms/:roomId', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>

    return HttpResponse.json({
      ...sampleRoom,
      id: Number(params.roomId),
      number: String(body.number ?? sampleRoom.number),
    })
  }),
  deleteSuccess: http.delete('*/api/v1/rooms/:roomId', () =>
    new HttpResponse(null, { status: 204 }),
  ),
}

export const server = setupServer(
  hotelHandlers.listSuccess,
  hotelHandlers.detailSuccess,
  hotelHandlers.createSuccess,
  hotelHandlers.updateSuccess,
  hotelHandlers.deleteSuccess,
  roomTypeHandlers.listSuccess,
  roomTypeHandlers.createSuccess,
  roomTypeHandlers.updateSuccess,
  roomTypeHandlers.deleteSuccess,
  roomHandlers.listSuccess,
  roomHandlers.createSuccess,
  roomHandlers.updateSuccess,
  roomHandlers.deleteSuccess,
)
