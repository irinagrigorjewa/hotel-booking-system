import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { roomTypeKeys } from '../keys'
import { deleteRoomType } from '../requests/deleteRoomType'

export const deleteRoomTypeMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (roomTypeId: number) => deleteRoomType(roomTypeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roomTypeKeys.lists() })
    },
  })
