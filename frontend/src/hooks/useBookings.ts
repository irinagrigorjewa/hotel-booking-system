export { useBookings } from '@entities/booking/api/queries/useBookings'
export { bookingKeys } from '@entities/booking/api/keys'

import { bookingKeys } from '@entities/booking/api/keys'
import type { BookingListParams } from '@entities/booking/model/types'

/** @deprecated Prefer `bookingKeys.list` */
export const bookingsQueryKey = (params: BookingListParams = {}) =>
  bookingKeys.list(params)
