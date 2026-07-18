import { useQuery } from '@tanstack/react-query'

import { hotelsApi } from '../api/hotels'

export const hotelQueryKey = (hotelId: number) => ['hotel', hotelId] as const

export const useHotel = (hotelId: number) =>
  useQuery({
    queryKey: hotelQueryKey(hotelId),
    queryFn: () => hotelsApi.getById(hotelId),
    enabled: Number.isInteger(hotelId) && hotelId > 0,
  })
