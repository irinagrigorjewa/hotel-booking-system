import { useQuery } from '@tanstack/react-query'

import { hotelsApi } from '../api/hotels'
import type { HotelListParams } from '../types/hotel'

export const hotelsQueryKey = (params: HotelListParams) =>
  ['hotels', params] as const

export const useHotels = (params: HotelListParams) =>
  useQuery({
    queryKey: hotelsQueryKey(params),
    queryFn: () => hotelsApi.list(params),
  })
