import { useQuery } from '@tanstack/react-query'

import { hotelsApi } from '../api/hotels'

export const hotelsMapQueryKey = (city?: string) =>
  ['hotels-map', city ?? ''] as const

export const useHotelsMap = (city?: string) =>
  useQuery({
    queryKey: hotelsMapQueryKey(city),
    queryFn: () => hotelsApi.getMap(city),
  })
