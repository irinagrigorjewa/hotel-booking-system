import type { BookingStatus } from '../types/booking'

export const STAR_OPTIONS = [1, 2, 3, 4, 5] as const

export const BOOKING_STATUS_OPTIONS: readonly BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
]

export const SKELETON_CARD_COUNT = 6

export const SKELETON_CARD_KEYS = Array.from(
  { length: SKELETON_CARD_COUNT },
  (_, index) => index,
)
