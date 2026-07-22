import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { hotelKeys } from '@entities/hotel/api/keys'

import { reviewKeys } from '../keys'
import { deleteReview } from '../requests/deleteReview'

export const deleteReviewMutationOptions = (
  queryClient: QueryClient,
  hotelId: number,
) =>
  mutationOptions({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reviewKeys.hotel(hotelId) })
      await queryClient.invalidateQueries({
        queryKey: hotelKeys.detail(hotelId),
      })
      await queryClient.invalidateQueries({ queryKey: hotelKeys.lists() })
    },
  })
