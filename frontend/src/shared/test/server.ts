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
            cover_image: null as string | null,
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
  mapSuccess: http.get('*/api/v1/hotels/map', ({ request }) => {
    const city = new URL(request.url).searchParams.get('city')
    const items = [
      {
        id: 1,
        name: city ? `${city} Hotel` : 'Grand Hotel',
        latitude: '55.7558',
        longitude: '37.6173',
        stars: 4,
        min_price: '3500.00',
        avg_rating: 4.5,
      },
    ]

    return HttpResponse.json({
      items: city && city.toLowerCase() !== 'moscow' ? [] : items,
    })
  }),
  mapEmpty: http.get('*/api/v1/hotels/map', () =>
    HttpResponse.json({ items: [] }),
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
  detailSuccess: http.get('*/api/v1/rooms/:roomId', ({ params }) =>
    HttpResponse.json({
      ...sampleRoom,
      id: Number(params.roomId),
    }),
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

const sampleBooking = {
  id: 100,
  user_id: 2,
  room_id: 5,
  check_in: '2026-08-10',
  check_out: '2026-08-15',
  nights: 5,
  total_price: '27500.00',
  status: 'CONFIRMED' as const,
  created_at: '2026-07-19T12:00:00Z',
  room: {
    id: 5,
    number: '301',
    price: '5500.00',
    hotel_id: 1,
    hotel_name: 'Grand Hotel',
  },
  user: {
    id: 2,
    name: 'Client User',
    email: 'client@example.com',
  },
}

export const bookingHandlers = {
  listSuccess: http.get('*/api/v1/bookings', () =>
    HttpResponse.json({
      items: [sampleBooking],
      total: 1,
      page: 1,
      size: 50,
    }),
  ),
  listEmpty: http.get('*/api/v1/bookings', () =>
    HttpResponse.json({ items: [], total: 0, page: 1, size: 50 }),
  ),
  createSuccess: http.post('*/api/v1/bookings', async ({ request }) => {
    const body = (await request.json()) as {
      room_id?: number
      check_in?: string
      check_out?: string
    }

    return HttpResponse.json(
      {
        ...sampleBooking,
        id: 101,
        room_id: body.room_id ?? 5,
        check_in: body.check_in ?? sampleBooking.check_in,
        check_out: body.check_out ?? sampleBooking.check_out,
      },
      { status: 201 },
    )
  }),
  createConflict: http.post('*/api/v1/bookings', () =>
    HttpResponse.json(
      { detail: 'Booking dates overlap with an existing booking' },
      { status: 409 },
    ),
  ),
  cancelSuccess: http.patch('*/api/v1/bookings/:bookingId/cancel', ({ params }) =>
    HttpResponse.json({
      ...sampleBooking,
      id: Number(params.bookingId),
      status: 'CANCELLED',
    }),
  ),
  updateStatusSuccess: http.patch('*/api/v1/bookings/:bookingId', async ({ params, request }) => {
    const body = (await request.json()) as { status?: string }

    return HttpResponse.json({
      ...sampleBooking,
      id: Number(params.bookingId),
      status: body.status ?? sampleBooking.status,
      user: sampleBooking.user,
    })
  }),
}

const sampleUsers = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@example.com',
    phone: null,
    role: 'ADMIN',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Client User',
    email: 'client@example.com',
    phone: null,
    role: 'CLIENT',
    created_at: '2026-07-02T10:00:00Z',
  },
]

export const userHandlers = {
  listSuccess: http.get('*/api/v1/users', () =>
    HttpResponse.json({
      items: sampleUsers,
      total: sampleUsers.length,
      page: 1,
      size: 100,
    }),
  ),
  patchMeSuccess: http.patch('*/api/v1/users/me', async ({ request }) => {
    const body = (await request.json()) as { name?: string; phone?: string | null }

    return HttpResponse.json({
      ...sampleUsers[1],
      name: body.name ?? sampleUsers[1].name,
      phone: body.phone === undefined ? sampleUsers[1].phone : body.phone,
    })
  }),
  patchUserSuccess: http.patch('*/api/v1/users/:userId', async ({ params, request }) => {
    const body = (await request.json()) as { role?: string }
    const user = sampleUsers.find((item) => item.id === Number(params.userId)) ?? sampleUsers[1]

    return HttpResponse.json({
      ...user,
      role: body.role ?? user.role,
    })
  }),
}

const sampleReview = {
  id: 7,
  hotel_id: 1,
  user_id: 2,
  user_name: 'Иван Иванов',
  rating: 5,
  comment: 'Отличный отель, чисто и тихо.',
  created_at: '2026-07-10T18:00:00Z',
  updated_at: '2026-07-10T18:00:00Z',
}

export const reviewHandlers = {
  listSuccess: http.get('*/api/v1/hotels/:hotelId/reviews', () =>
    HttpResponse.json({
      items: [sampleReview],
      total: 1,
      page: 1,
      size: 20,
    }),
  ),
  listEmpty: http.get('*/api/v1/hotels/:hotelId/reviews', () =>
    HttpResponse.json({ items: [], total: 0, page: 1, size: 20 }),
  ),
  createSuccess: http.post('*/api/v1/hotels/:hotelId/reviews', async ({ params, request }) => {
    const body = (await request.json()) as { rating?: number; comment?: string }

    return HttpResponse.json(
      {
        ...sampleReview,
        id: 8,
        hotel_id: Number(params.hotelId),
        rating: body.rating ?? 5,
        comment: body.comment ?? sampleReview.comment,
      },
      { status: 201 },
    )
  }),
  createConflict: http.post('*/api/v1/hotels/:hotelId/reviews', () =>
    HttpResponse.json({ detail: 'Review already exists' }, { status: 409 }),
  ),
  deleteSuccess: http.delete('*/api/v1/reviews/:reviewId', () =>
    new HttpResponse(null, { status: 204 }),
  ),
}

export const favoriteHandlers = {
  listSuccess: http.get('*/api/v1/favorites', () =>
    HttpResponse.json({
      items: [
        {
          id: 1,
          name: 'Grand Hotel',
          city: 'Moscow',
          address: 'Main st 1',
          description: 'Central hotel',
          stars: 4,
          latitude: '55.75',
          longitude: '37.61',
          created_at: '2026-07-18T10:00:00Z',
          avg_rating: 4.5,
          reviews_count: 1,
          min_price: null,
          cover_image: null,
          is_favorite: true,
        },
      ],
      total: 1,
      page: 1,
      size: 20,
    }),
  ),
  listEmpty: http.get('*/api/v1/favorites', () =>
    HttpResponse.json({ items: [], total: 0, page: 1, size: 20 }),
  ),
  addSuccess: http.post('*/api/v1/favorites/:hotelId', ({ params }) =>
    HttpResponse.json(
      {
        hotel_id: Number(params.hotelId),
        user_id: 2,
        created_at: '2026-07-19T12:00:00Z',
      },
      { status: 201 },
    ),
  ),
  removeSuccess: http.delete('*/api/v1/favorites/:hotelId', () =>
    new HttpResponse(null, { status: 204 }),
  ),
}

export const server = setupServer(
  hotelHandlers.mapSuccess,
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
  roomHandlers.detailSuccess,
  roomHandlers.createSuccess,
  roomHandlers.updateSuccess,
  roomHandlers.deleteSuccess,
  bookingHandlers.listSuccess,
  bookingHandlers.createSuccess,
  bookingHandlers.cancelSuccess,
  bookingHandlers.updateStatusSuccess,
  userHandlers.listSuccess,
  userHandlers.patchMeSuccess,
  userHandlers.patchUserSuccess,
  reviewHandlers.listSuccess,
  reviewHandlers.createSuccess,
  reviewHandlers.deleteSuccess,
  favoriteHandlers.listSuccess,
  favoriteHandlers.addSuccess,
  favoriteHandlers.removeSuccess,
)
