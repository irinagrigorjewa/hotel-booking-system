import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import type { HotelWritePayload } from '../../model/types'
import { hotelKeys } from '../keys'
import { createHotel } from '../requests/createHotel'

export const createHotelMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (payload: HotelWritePayload) => createHotel(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: hotelKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: hotelKeys.maps() })
    },
  })
