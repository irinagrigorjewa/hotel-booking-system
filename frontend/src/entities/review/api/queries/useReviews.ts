import { useQuery } from '@tanstack/react-query'

import type { ReviewListParams } from '../../model/types'
import { reviewsQueryOptions } from './reviewsQueryOptions'

export const useReviews = (hotelId: number, params: ReviewListParams = {}) =>
  useQuery(reviewsQueryOptions(hotelId, params))
