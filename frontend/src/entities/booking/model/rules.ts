import type { BookingStatus } from './types'

export const canCancelBooking = (status: BookingStatus): boolean =>
  status === 'PENDING' || status === 'CONFIRMED'
