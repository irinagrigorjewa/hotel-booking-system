import { useQuery } from '@tanstack/react-query'

import { hotelsMapQueryOptions } from './hotelsMapQueryOptions'

export const useHotelsMap = (city?: string) =>
  useQuery(hotelsMapQueryOptions(city))
