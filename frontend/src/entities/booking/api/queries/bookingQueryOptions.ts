import { queryOptions } from '@tanstack/react-query'

import { bookingKeys } from '../keys'
import { getBooking } from '../requests/getBooking'

export const bookingQueryOptions = (bookingId: number) =>
  queryOptions({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => getBooking(bookingId),
  })
