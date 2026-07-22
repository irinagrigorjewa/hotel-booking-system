import type {
  HotelDetail,
  HotelListItem,
  HotelPage,
} from '@entities/hotel/model/types'

export const createHotelListItem = (
  overrides: Partial<HotelListItem> = {},
): HotelListItem => ({
  id: 1,
  name: 'Grand Hotel',
  city: 'Moscow',
  address: 'Tverskaya 1',
  description: 'Central hotel',
  stars: 5,
  latitude: '55.75',
  longitude: '37.61',
  created_at: '2026-07-18T10:00:00Z',
  avg_rating: null,
  reviews_count: 0,
  min_price: null,
  cover_image: null as string | null,
  is_favorite: null,
  ...overrides,
})

export const createHotelPage = (
  overrides: Partial<HotelPage> = {},
): HotelPage => ({
  items: [createHotelListItem()],
  total: 1,
  page: 1,
  size: 20,
  ...overrides,
})

export const createHotelDetail = (
  overrides: Partial<HotelDetail> = {},
): HotelDetail => ({
  ...createHotelListItem(),
  images: [],
  ...overrides,
})
