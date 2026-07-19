import { useQuery } from '@tanstack/react-query'

import { bookingsApi } from '../api/bookings'
import type { BookingListParams } from '../types/booking'

export const bookingsQueryKey = (params: BookingListParams = {}) =>
  ['bookings', params] as const

export const useBookings = (params: BookingListParams = {}) =>
  useQuery({
    queryKey: bookingsQueryKey(params),
    queryFn: () => bookingsApi.list(params),
  })
