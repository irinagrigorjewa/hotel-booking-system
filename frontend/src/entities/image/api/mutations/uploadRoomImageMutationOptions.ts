import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { roomKeys } from '@entities/room/api/keys'

import { uploadRoomImage } from '../requests/uploadRoomImage'

export const uploadRoomImageMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: ({
      roomId,
      file,
      sortOrder = 0,
    }: {
      roomId: number
      file: File
      sortOrder?: number
    }) => uploadRoomImage(roomId, file, sortOrder),
    onSuccess: async (_data, { roomId }) => {
      await queryClient.invalidateQueries({
        queryKey: roomKeys.detail(roomId),
      })
      await queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
    },
  })
