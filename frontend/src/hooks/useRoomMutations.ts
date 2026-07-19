import { useMutation, useQueryClient } from '@tanstack/react-query'

import { roomsApi } from '../api/rooms'
import type { RoomWritePayload } from '../types/room'

export const useRoomMutations = () => {
  const queryClient = useQueryClient()

  const invalidate = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['rooms'] })
  }

  const createRoom = useMutation({
    mutationFn: (payload: RoomWritePayload) => roomsApi.create(payload),
    onSuccess: invalidate,
  })

  const updateRoom = useMutation({
    mutationFn: ({
      roomId,
      payload,
    }: {
      roomId: number
      payload: RoomWritePayload
    }) => roomsApi.update(roomId, payload),
    onSuccess: invalidate,
  })

  const deleteRoom = useMutation({
    mutationFn: (roomId: number) => roomsApi.remove(roomId),
    onSuccess: invalidate,
  })

  return { createRoom, updateRoom, deleteRoom }
}
