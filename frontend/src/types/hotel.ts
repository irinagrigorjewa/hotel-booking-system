export type HotelSort = 'created_at' | 'stars' | 'avg_rating'

export interface HotelListItem {
  id: number
  name: string
  city: string
  address: string
  description: string | null
  stars: number
  latitude: string
  longitude: string
  created_at: string
  avg_rating: number | null
  reviews_count: number
  min_price: string | null
  cover_image: string | null
  is_favorite: boolean | null
}

export interface HotelImage {
  id: number
  url: string
  sort_order: number
}

export interface HotelDetail extends HotelListItem {
  images: HotelImage[]
}

export interface HotelPage {
  items: HotelListItem[]
  total: number
  page: number
  size: number
}

export interface HotelListParams {
  city?: string
  stars?: number
  sort?: HotelSort
  order?: 'asc' | 'desc'
  page?: number
  size?: number
}

export interface HotelWritePayload {
  name: string
  city: string
  address: string
  description?: string | null
  stars: number
  latitude: number
  longitude: number
}
