import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { hotelKeys } from '@entities/hotel/api/keys'

import { deleteImage } from '../requests/deleteImage'

export const deleteImageMutationOptions = (
  queryClient: QueryClient,
  hotelId: number,
) =>
  mutationOptions({
    mutationFn: (imageId: number) => deleteImage(imageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: hotelKeys.detail(hotelId),
      })
      await queryClient.invalidateQueries({ queryKey: hotelKeys.lists() })
    },
  })
