import { queryOptions } from '@tanstack/react-query'

import { hotelKeys } from '../keys'
import { getHotel } from '../requests/getHotel'

export const hotelQueryOptions = (hotelId: number) =>
  queryOptions({
    queryKey: hotelKeys.detail(hotelId),
    queryFn: () => getHotel(hotelId),
    enabled: Number.isInteger(hotelId) && hotelId > 0,
  })
