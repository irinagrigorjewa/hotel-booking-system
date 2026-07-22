import { queryOptions } from '@tanstack/react-query'

import type { ReviewListParams } from '../../model/types'
import { reviewKeys } from '../keys'
import { listReviews } from '../requests/listReviews'

export const reviewsQueryOptions = (
  hotelId: number,
  params: ReviewListParams = {},
) =>
  queryOptions({
    queryKey: reviewKeys.list(hotelId, params),
    queryFn: () => listReviews(hotelId, params),
    enabled: Number.isInteger(hotelId) && hotelId > 0,
  })
