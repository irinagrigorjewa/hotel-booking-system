import { apiClient } from '@shared/api/client'

export const deleteReview = async (reviewId: number): Promise<void> => {
  await apiClient.delete(`/reviews/${reviewId}`)
}
