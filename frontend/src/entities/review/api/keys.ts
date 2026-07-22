import type { ReviewListParams } from '../model/types'

export const reviewKeys = {
  all: ['reviews'] as const,
  hotel: (hotelId: number) => [...reviewKeys.all, hotelId] as const,
  list: (hotelId: number, params: ReviewListParams = {}) =>
    [...reviewKeys.hotel(hotelId), params] as const,
}
