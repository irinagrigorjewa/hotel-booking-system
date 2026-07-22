import { hotelKeys } from '@entities/hotel/api/keys'
import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import type { RoomWritePayload } from '../../model/types'
import { roomKeys } from '../keys'
import { createRoom } from '../requests/createRoom'

export const createRoomMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (payload: RoomWritePayload) => createRoom(payload),
    onSuccess: async (room) => {
      await queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
      await queryClient.invalidateQueries({
        queryKey: hotelKeys.detail(room.hotel_id),
      })
    },
  })
