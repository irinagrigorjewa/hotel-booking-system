import { useMutation, useQueryClient } from '@tanstack/react-query'

import { hotelsApi } from '../api/hotels'
import type { HotelWritePayload } from '../types/hotel'
import { hotelQueryKey } from './useHotel'
import { hotelsQueryKey } from './useHotels'

export const useHotelMutations = () => {
  const queryClient = useQueryClient()

  const invalidateHotels = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['hotels'] })
  }

  const createHotel = useMutation({
    mutationFn: (payload: HotelWritePayload) => hotelsApi.create(payload),
    onSuccess: async () => {
      await invalidateHotels()
    },
  })

  const updateHotel = useMutation({
    mutationFn: ({
      hotelId,
      payload,
    }: {
      hotelId: number
      payload: HotelWritePayload
    }) => hotelsApi.update(hotelId, payload),
    onSuccess: async (hotel) => {
      await invalidateHotels()
      await queryClient.invalidateQueries({ queryKey: hotelQueryKey(hotel.id) })
    },
  })

  const deleteHotel = useMutation({
    mutationFn: (hotelId: number) => hotelsApi.remove(hotelId),
    onSuccess: async () => {
      await invalidateHotels()
    },
  })

  return { createHotel, updateHotel, deleteHotel, hotelsQueryKey }
}
