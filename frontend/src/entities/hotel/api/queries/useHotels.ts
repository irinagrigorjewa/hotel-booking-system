import { useQuery } from '@tanstack/react-query'

import type { HotelListParams } from '../../model/types'
import { hotelsQueryOptions } from './hotelsQueryOptions'

export const useHotels = (params: HotelListParams) =>
  useQuery(hotelsQueryOptions(params))
