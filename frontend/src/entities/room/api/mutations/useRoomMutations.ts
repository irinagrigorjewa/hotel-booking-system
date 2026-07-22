import { useMutation, useQueryClient } from '@tanstack/react-query'

import { roomKeys } from '../keys'
import { createRoomMutationOptions } from './createRoomMutationOptions'
import { deleteRoomMutationOptions } from './deleteRoomMutationOptions'
import { updateRoomMutationOptions } from './updateRoomMutationOptions'

export const useRoomMutations = () => {
  const queryClient = useQueryClient()

  const createRoom = useMutation(createRoomMutationOptions(queryClient))
  const updateRoom = useMutation(updateRoomMutationOptions(queryClient))
  const deleteRoom = useMutation(deleteRoomMutationOptions(queryClient))

  return {
    createRoom,
    updateRoom,
    deleteRoom,
    roomsQueryKey: roomKeys.list,
  }
}
