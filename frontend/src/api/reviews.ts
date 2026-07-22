import { apiClient } from '@shared/api/client'
import type {
  Review,
  ReviewListParams,
  ReviewPage,
  ReviewWritePayload,
} from '../types/review'

export const reviewsApi = {
  list: async (
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
  },

  create: async (hotelId: number, payload: ReviewWritePayload): Promise<Review> => {
    const { data } = await apiClient.post<Review>(
      `/hotels/${hotelId}/reviews`,
      payload,
    )

    return data
  },

  update: async (reviewId: number, payload: Partial<ReviewWritePayload>): Promise<Review> => {
    const { data } = await apiClient.patch<Review>(`/reviews/${reviewId}`, payload)

    return data
  },

  remove: async (reviewId: number): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}`)
  },
}
