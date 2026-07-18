import { useMutation, useQueryClient } from '@tanstack/react-query'

import { roomTypesApi } from '../api/roomTypes'
import type { RoomTypeWritePayload } from '../types/roomType'

export const useRoomTypeMutations = () => {
  const queryClient = useQueryClient()

  const invalidate = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['room-types'] })
  }

  const createRoomType = useMutation({
    mutationFn: (payload: RoomTypeWritePayload) => roomTypesApi.create(payload),
    onSuccess: invalidate,
  })

  const updateRoomType = useMutation({
    mutationFn: ({
      roomTypeId,
      payload,
    }: {
      roomTypeId: number
      payload: RoomTypeWritePayload
    }) => roomTypesApi.update(roomTypeId, payload),
    onSuccess: invalidate,
  })

  const deleteRoomType = useMutation({
    mutationFn: (roomTypeId: number) => roomTypesApi.remove(roomTypeId),
    onSuccess: invalidate,
  })

  return { createRoomType, updateRoomType, deleteRoomType }
}
