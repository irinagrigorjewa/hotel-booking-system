import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { hotelKeys } from '../keys'
import { deleteHotel } from '../requests/deleteHotel'

export const deleteHotelMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (hotelId: number) => deleteHotel(hotelId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: hotelKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: hotelKeys.maps() })
    },
  })
