import { useMutation, useQueryClient } from '@tanstack/react-query'

import { roomTypeKeys } from '../keys'
import { createRoomTypeMutationOptions } from './createRoomTypeMutationOptions'
import { deleteRoomTypeMutationOptions } from './deleteRoomTypeMutationOptions'
import { updateRoomTypeMutationOptions } from './updateRoomTypeMutationOptions'

export const useRoomTypeMutations = () => {
  const queryClient = useQueryClient()

  const createRoomType = useMutation(
    createRoomTypeMutationOptions(queryClient),
  )
  const updateRoomType = useMutation(
    updateRoomTypeMutationOptions(queryClient),
  )
  const deleteRoomType = useMutation(
    deleteRoomTypeMutationOptions(queryClient),
  )

  return {
    createRoomType,
    updateRoomType,
    deleteRoomType,
    roomTypesQueryKey: roomTypeKeys.list,
  }
}
