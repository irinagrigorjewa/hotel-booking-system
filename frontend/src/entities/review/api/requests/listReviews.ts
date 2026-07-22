import { apiClient } from '@shared/api/client'

import type { ReviewListParams, ReviewPage } from '../../model/types'

export const listReviews = async (
  hotelId: number,
  params: ReviewListParams = {},
): Promise<ReviewPage> => {
  const { data } = await apiClient.get<ReviewPage>(`/hotels/${hotelId}/reviews`, {
    params: {
      page: params.page ?? 1,
      size: params.size ?? 20,
      order: params.order ?? 'desc',
    },
  })

  return data
}
