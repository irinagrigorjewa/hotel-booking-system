import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { hotelKeys } from '@entities/hotel/api/keys'

import type { ReviewWritePayload } from '../../model/types'
import { reviewKeys } from '../keys'
import { createReview } from '../requests/createReview'

export const createReviewMutationOptions = (
  queryClient: QueryClient,
  hotelId: number,
) =>
  mutationOptions({
    mutationFn: (payload: ReviewWritePayload) => createReview(hotelId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reviewKeys.hotel(hotelId) })
      await queryClient.invalidateQueries({
        queryKey: hotelKeys.detail(hotelId),
      })
      await queryClient.invalidateQueries({ queryKey: hotelKeys.lists() })
    },
  })
