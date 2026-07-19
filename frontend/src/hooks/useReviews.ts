import { useQuery } from '@tanstack/react-query'

import { reviewsApi } from '../api/reviews'
import type { ReviewListParams } from '../types/review'

export const reviewsQueryKey = (hotelId: number, params: ReviewListParams = {}) =>
  ['reviews', hotelId, params] as const

export const useReviews = (hotelId: number, params: ReviewListParams = {}) =>
  useQuery({
    queryKey: reviewsQueryKey(hotelId, params),
    queryFn: () => reviewsApi.list(hotelId, params),
    enabled: Number.isInteger(hotelId) && hotelId > 0,
  })
