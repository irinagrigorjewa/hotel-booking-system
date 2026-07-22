import { createReview } from '@entities/review/api/requests/createReview'
import { deleteReview } from '@entities/review/api/requests/deleteReview'
import { listReviews } from '@entities/review/api/requests/listReviews'
import { updateReview } from '@entities/review/api/requests/updateReview'

/** @deprecated Prefer `@entities/review/api/requests/*` */
export const reviewsApi = {
  list: listReviews,
  create: createReview,
  update: updateReview,
  remove: deleteReview,
}
