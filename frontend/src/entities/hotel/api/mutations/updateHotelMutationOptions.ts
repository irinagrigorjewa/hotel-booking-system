import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import type { HotelWritePayload } from '../../model/types'
import { hotelKeys } from '../keys'
import { updateHotel } from '../requests/updateHotel'

export const updateHotelMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: ({
      hotelId,
      payload,
    }: {
      hotelId: number
      payload: HotelWritePayload
    }) => updateHotel(hotelId, payload),
    onSuccess: async (hotel) => {
      await queryClient.invalidateQueries({ queryKey: hotelKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: hotelKeys.maps() })
      await queryClient.invalidateQueries({
        queryKey: hotelKeys.detail(hotel.id),
      })
    },
  })
