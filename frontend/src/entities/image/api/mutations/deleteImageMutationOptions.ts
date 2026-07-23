import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { hotelKeys } from '@entities/hotel/api/keys'
import { roomKeys } from '@entities/room/api/keys'

import { deleteImage } from '../requests/deleteImage'

export type ImageParentRef =
  | { hotelId: number }
  | { roomId: number }

const invalidateParent = async (
  queryClient: QueryClient,
  parent: ImageParentRef,
): Promise<void> => {
  if ('hotelId' in parent) {
    await queryClient.invalidateQueries({
      queryKey: hotelKeys.detail(parent.hotelId),
    })
    await queryClient.invalidateQueries({ queryKey: hotelKeys.lists() })
    return
  }

  await queryClient.invalidateQueries({
    queryKey: roomKeys.detail(parent.roomId),
  })
  await queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
}

export const deleteImageMutationOptions = (
  queryClient: QueryClient,
  parent: ImageParentRef,
) =>
  mutationOptions({
    mutationFn: (imageId: number) => deleteImage(imageId),
    onSuccess: async () => {
      await invalidateParent(queryClient, parent)
    },
  })
