import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createReviewMutationOptions } from './createReviewMutationOptions'
import { deleteReviewMutationOptions } from './deleteReviewMutationOptions'

export const useReviewMutations = (hotelId: number) => {
  const queryClient = useQueryClient()

  const createReview = useMutation(
    createReviewMutationOptions(queryClient, hotelId),
  )
  const deleteReview = useMutation(
    deleteReviewMutationOptions(queryClient, hotelId),
  )

  return { createReview, deleteReview }
}
