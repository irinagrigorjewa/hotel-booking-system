import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { roomKeys } from '../keys'
import { deleteRoom } from '../requests/deleteRoom'

export const deleteRoomMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (roomId: number) => deleteRoom(roomId),
    onSuccess: async (_data, roomId) => {
      await queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
      await queryClient.invalidateQueries({
        queryKey: roomKeys.detail(roomId),
      })
    },
  })
