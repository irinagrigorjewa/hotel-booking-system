import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import type { RoomTypeWritePayload } from '../../model/types'
import { roomTypeKeys } from '../keys'
import { createRoomType } from '../requests/createRoomType'

export const createRoomTypeMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (payload: RoomTypeWritePayload) => createRoomType(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roomTypeKeys.lists() })
    },
  })
