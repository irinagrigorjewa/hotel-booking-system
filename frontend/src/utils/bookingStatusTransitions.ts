import type { BookingStatus } from '../types/booking'

/** Mirrors backend `_ALLOWED_TRANSITIONS` in services/bookings.py */
export const ALLOWED_STATUS_TRANSITIONS: Record<
  BookingStatus,
  readonly BookingStatus[]
> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CANCELLED', 'COMPLETED'],
  CANCELLED: [],
  COMPLETED: [],
}

/** Current status plus allowed next statuses (for Select value + options). */
export const statusSelectOptions = (
  current: BookingStatus,
): BookingStatus[] => [current, ...ALLOWED_STATUS_TRANSITIONS[current]]
