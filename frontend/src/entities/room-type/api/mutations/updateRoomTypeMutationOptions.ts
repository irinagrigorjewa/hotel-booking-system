import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import type { RoomTypeWritePayload } from '../../model/types'
import { roomTypeKeys } from '../keys'
import { updateRoomType } from '../requests/updateRoomType'

export const updateRoomTypeMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: ({
      roomTypeId,
      payload,
    }: {
      roomTypeId: number
      payload: RoomTypeWritePayload
    }) => updateRoomType(roomTypeId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roomTypeKeys.lists() })
    },
  })
