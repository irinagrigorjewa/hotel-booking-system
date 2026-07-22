import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { bookingKeys } from '../keys'
import { cancelBooking } from '../requests/cancelBooking'

export const cancelBookingMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (bookingId: number) => cancelBooking(bookingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
    },
  })
