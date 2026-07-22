import { apiClient } from '@shared/api/client'

import type { Booking } from '../../model/types'

export const cancelBooking = async (bookingId: number): Promise<Booking> => {
  const { data } = await apiClient.patch<Booking>(`/bookings/${bookingId}/cancel`)

  return data
}
