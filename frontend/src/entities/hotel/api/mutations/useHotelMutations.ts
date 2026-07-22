import { useMutation, useQueryClient } from '@tanstack/react-query'

import { hotelKeys } from '../keys'
import { createHotelMutationOptions } from './createHotelMutationOptions'
import { deleteHotelMutationOptions } from './deleteHotelMutationOptions'
import { updateHotelMutationOptions } from './updateHotelMutationOptions'

export const useHotelMutations = () => {
  const queryClient = useQueryClient()

  const createHotel = useMutation(createHotelMutationOptions(queryClient))
  const updateHotel = useMutation(updateHotelMutationOptions(queryClient))
  const deleteHotel = useMutation(deleteHotelMutationOptions(queryClient))

  return {
    createHotel,
    updateHotel,
    deleteHotel,
    hotelsQueryKey: hotelKeys.list,
  }
}
