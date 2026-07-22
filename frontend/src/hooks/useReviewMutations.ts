import { useMutation, useQueryClient } from '@tanstack/react-query'

import { hotelKeys } from '@entities/hotel/api/keys'

import { reviewsApi } from '../api/reviews'
import type { ReviewWritePayload } from '../types/review'

export const useReviewMutations = (hotelId: number) => {
  const queryClient = useQueryClient()

  const invalidate = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['reviews', hotelId] })
    await queryClient.invalidateQueries({
      queryKey: hotelKeys.detail(hotelId),
    })
    await queryClient.invalidateQueries({ queryKey: hotelKeys.all })
  }

  const createReview = useMutation({
    mutationFn: (payload: ReviewWritePayload) => reviewsApi.create(hotelId, payload),
    onSuccess: async () => {
      await invalidate()
    },
  })

  const deleteReview = useMutation({
    mutationFn: (reviewId: number) => reviewsApi.remove(reviewId),
    onSuccess: async () => {
      await invalidate()
    },
  })

  return { createReview, deleteReview }
}
