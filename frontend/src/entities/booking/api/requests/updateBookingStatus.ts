import { apiClient } from '@shared/api/client'

import type { Booking } from '../../model/types'

export const updateBookingStatus = async (
  bookingId: number,
  status: Booking['status'],
): Promise<Booking> => {
  const { data } = await apiClient.patch<Booking>(`/bookings/${bookingId}`, {
    status,
  })

  return data
}
