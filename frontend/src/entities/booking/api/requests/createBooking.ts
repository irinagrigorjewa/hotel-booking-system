import { apiClient } from '@shared/api/client'

import type { Booking, BookingCreatePayload } from '../../model/types'

export const createBooking = async (
  payload: BookingCreatePayload,
): Promise<Booking> => {
  const { data } = await apiClient.post<Booking>('/bookings', payload)

  return data
}
