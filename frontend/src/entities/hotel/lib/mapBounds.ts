import L from 'leaflet'

import type { HotelMapItem } from '../model/map-types'

/** Default map center (Moscow) when no hotels / no singleCenter. */
export const DEFAULT_MAP_CENTER: [number, number] = [55.75, 37.62]

export const resolveMapCenter = (
  hotels: HotelMapItem[],
  singleCenter?: [number, number],
): [number, number] =>
  singleCenter ??
  (hotels[0]
    ? [Number(hotels[0].latitude), Number(hotels[0].longitude)]
    : DEFAULT_MAP_CENTER)

export const fitHotelsBounds = (
  map: L.Map,
  hotels: HotelMapItem[],
): void => {
  if (hotels.length === 0) {
    return
  }

  const bounds = L.latLngBounds(
    hotels.map((hotel) => [Number(hotel.latitude), Number(hotel.longitude)]),
  )
  map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 })
}
