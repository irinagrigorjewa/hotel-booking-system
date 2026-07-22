export interface HotelMapItem {
  id: number
  name: string
  latitude: string
  longitude: string
  stars: number
  min_price: string | null
  avg_rating: number | null
}

export interface HotelMapResponse {
  items: HotelMapItem[]
}
