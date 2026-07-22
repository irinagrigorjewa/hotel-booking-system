import { apiClient } from '@shared/api/client'

import type { Booking } from '../../model/types'

export const getBooking = async (bookingId: number): Promise<Booking> => {
  const { data } = await apiClient.get<Booking>(`/bookings/${bookingId}`)

  return data
}
