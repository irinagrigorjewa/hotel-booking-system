import type { HotelListParams } from '../model/types'

export const hotelKeys = {
  all: ['hotels'] as const,
  lists: () => [...hotelKeys.all, 'list'] as const,
  list: (params: HotelListParams) => [...hotelKeys.lists(), params] as const,
  details: () => [...hotelKeys.all, 'detail'] as const,
  detail: (id: number) => [...hotelKeys.details(), id] as const,
  maps: () => [...hotelKeys.all, 'map'] as const,
  map: (city?: string) => [...hotelKeys.maps(), city ?? ''] as const,
}
