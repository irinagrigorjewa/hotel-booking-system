import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { hotelKeys } from '@entities/hotel/api/keys'

import { uploadHotelImage } from '../requests/uploadHotelImage'

export const uploadHotelImageMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: ({
      hotelId,
      file,
      sortOrder = 0,
    }: {
      hotelId: number
      file: File
      sortOrder?: number
    }) => uploadHotelImage(hotelId, file, sortOrder),
    onSuccess: async (_data, { hotelId }) => {
      await queryClient.invalidateQueries({
        queryKey: hotelKeys.detail(hotelId),
      })
    },
  })
