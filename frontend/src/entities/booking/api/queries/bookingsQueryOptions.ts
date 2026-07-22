import { queryOptions } from '@tanstack/react-query'

import type { BookingListParams } from '../../model/types'
import { bookingKeys } from '../keys'
import { listBookings } from '../requests/listBookings'

export const bookingsQueryOptions = (params: BookingListParams = {}) =>
  queryOptions({
    queryKey: bookingKeys.list(params),
    queryFn: () => listBookings(params),
  })
