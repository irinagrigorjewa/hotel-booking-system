import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { hotelKeys } from '@entities/hotel/api/keys'

import { updateImageSortOrder } from '../requests/updateImageSortOrder'

export interface UpdateImageSortOrderInput {
  imageId: number
  sortOrder: number
}

export const updateImageSortOrderMutationOptions = (
  queryClient: QueryClient,
  hotelId: number,
) =>
  mutationOptions({
    mutationFn: async (updates: ReadonlyArray<UpdateImageSortOrderInput>) => {
      await Promise.all(
        updates.map(({ imageId, sortOrder }) =>
          updateImageSortOrder(imageId, sortOrder),
        ),
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: hotelKeys.detail(hotelId),
      })
      await queryClient.invalidateQueries({ queryKey: hotelKeys.lists() })
    },
  })
