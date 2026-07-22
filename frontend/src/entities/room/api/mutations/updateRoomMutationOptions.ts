import { hotelKeys } from '@entities/hotel/api/keys'
import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import type { RoomWritePayload } from '../../model/types'
import { roomKeys } from '../keys'
import { updateRoom } from '../requests/updateRoom'

export const updateRoomMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: ({
      roomId,
      payload,
    }: {
      roomId: number
      payload: RoomWritePayload
    }) => updateRoom(roomId, payload),
    onSuccess: async (room) => {
      await queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
      await queryClient.invalidateQueries({
        queryKey: roomKeys.detail(room.id),
      })
      await queryClient.invalidateQueries({
        queryKey: hotelKeys.detail(room.hotel_id),
      })
    },
  })
