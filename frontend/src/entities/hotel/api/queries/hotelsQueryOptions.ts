import { queryOptions } from '@tanstack/react-query'

import type { HotelListParams } from '../../model/types'
import { hotelKeys } from '../keys'
import { listHotels } from '../requests/listHotels'

export const hotelsQueryOptions = (params: HotelListParams) =>
  queryOptions({
    queryKey: hotelKeys.list(params),
    queryFn: () => listHotels(params),
  })
