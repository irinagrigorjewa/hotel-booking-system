import { apiClient } from '@shared/api/client'

import type { Review, ReviewWritePayload } from '../../model/types'

export const updateReview = async (
  reviewId: number,
  payload: Partial<ReviewWritePayload>,
): Promise<Review> => {
  const { data } = await apiClient.patch<Review>(`/reviews/${reviewId}`, payload)

  return data
}
