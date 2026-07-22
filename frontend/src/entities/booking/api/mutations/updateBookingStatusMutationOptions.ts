import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import type { Booking } from '../../model/types'
import { bookingKeys } from '../keys'
import { updateBookingStatus } from '../requests/updateBookingStatus'

export const updateBookingStatusMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: number
      status: Booking['status']
    }) => updateBookingStatus(bookingId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
    },
  })
