import { useMutation, useQueryClient } from '@tanstack/react-query'

import { bookingsApi } from '../api/bookings'
import type { Booking, BookingCreatePayload } from '../types/booking'

export const useBookingMutations = () => {
  const queryClient = useQueryClient()

  const invalidateBookings = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['bookings'] })
  }

  const createBooking = useMutation({
    mutationFn: (payload: BookingCreatePayload) => bookingsApi.create(payload),
    onSuccess: async () => {
      await invalidateBookings()
    },
  })

  const cancelBooking = useMutation({
    mutationFn: (bookingId: number) => bookingsApi.cancel(bookingId),
    onSuccess: async () => {
      await invalidateBookings()
    },
  })

  const updateBookingStatus = useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: number
      status: Booking['status']
    }) => bookingsApi.updateStatus(bookingId, status),
    onSuccess: async () => {
      await invalidateBookings()
    },
  })

  return { createBooking, cancelBooking, updateBookingStatus }
}
