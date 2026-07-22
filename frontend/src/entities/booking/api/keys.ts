import type { BookingListParams } from '../model/types'

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (params: BookingListParams) => [...bookingKeys.lists(), params] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: number) => [...bookingKeys.details(), id] as const,
}
