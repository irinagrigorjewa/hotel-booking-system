import { useQuery } from '@tanstack/react-query'

import type { BookingListParams } from '../../model/types'
import { bookingsQueryOptions } from './bookingsQueryOptions'

export const useBookings = (params: BookingListParams = {}) =>
  useQuery(bookingsQueryOptions(params))
