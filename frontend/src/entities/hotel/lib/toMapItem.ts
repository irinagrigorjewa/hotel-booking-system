import type { HotelMapItem } from '../model/map-types'

export const toMapItem = (params: {
  hotelId: number
  name: string
  latitude: string
  longitude: string
}): HotelMapItem => ({
  id: params.hotelId,
  name: params.name,
  latitude: params.latitude,
  longitude: params.longitude,
  stars: 0,
  min_price: null,
  avg_rating: null,
})
