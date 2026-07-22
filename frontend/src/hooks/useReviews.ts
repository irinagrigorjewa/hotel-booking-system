export { useReviews } from '@entities/review/api/queries/useReviews'
export { reviewKeys } from '@entities/review/api/keys'

import { reviewKeys } from '@entities/review/api/keys'
import type { ReviewListParams } from '@entities/review/model/types'

/** @deprecated Prefer `reviewKeys.list` */
export const reviewsQueryKey = (
  hotelId: number,
  params: ReviewListParams = {},
) => reviewKeys.list(hotelId, params)
