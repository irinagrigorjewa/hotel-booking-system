import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { hotelKeys } from '@entities/hotel/api/keys'
import { roomKeys } from '@entities/room/api/keys'

import { updateImageSortOrder } from '../requests/updateImageSortOrder'
import type { ImageParentRef } from './deleteImageMutationOptions'

export interface UpdateImageSortOrderInput {
  imageId: number
  sortOrder: number
}

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

export const updateImageSortOrderMutationOptions = (
  queryClient: QueryClient,
  parent: ImageParentRef,
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
      await invalidateParent(queryClient, parent)
    },
  })
