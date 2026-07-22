import { useQuery } from '@tanstack/react-query'

import { bookingQueryOptions } from './bookingQueryOptions'

export const useBooking = (bookingId: number) =>
  useQuery(bookingQueryOptions(bookingId))
