import { apiClient } from '@shared/api/client'

import type { Review, ReviewWritePayload } from '../../model/types'

export const createReview = async (
  hotelId: number,
  payload: ReviewWritePayload,
): Promise<Review> => {
  const { data } = await apiClient.post<Review>(
    `/hotels/${hotelId}/reviews`,
    payload,
  )

  return data
}
