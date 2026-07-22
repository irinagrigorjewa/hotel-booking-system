import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import type { BookingCreatePayload } from '../../model/types'
import { bookingKeys } from '../keys'
import { createBooking } from '../requests/createBooking'

export const createBookingMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (payload: BookingCreatePayload) => createBooking(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
    },
  })
