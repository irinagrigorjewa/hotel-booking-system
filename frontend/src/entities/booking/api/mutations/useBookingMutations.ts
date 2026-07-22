import { useMutation, useQueryClient } from '@tanstack/react-query'

import { bookingKeys } from '../keys'
import { cancelBookingMutationOptions } from './cancelBookingMutationOptions'
import { createBookingMutationOptions } from './createBookingMutationOptions'
import { updateBookingStatusMutationOptions } from './updateBookingStatusMutationOptions'

export const useBookingMutations = () => {
  const queryClient = useQueryClient()

  const createBooking = useMutation(createBookingMutationOptions(queryClient))
  const cancelBooking = useMutation(cancelBookingMutationOptions(queryClient))
  const updateBookingStatus = useMutation(
    updateBookingStatusMutationOptions(queryClient),
  )

  return {
    createBooking,
    cancelBooking,
    updateBookingStatus,
    bookingsQueryKey: bookingKeys.list,
  }
}
