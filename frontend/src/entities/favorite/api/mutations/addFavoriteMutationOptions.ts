import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { hotelKeys } from '@entities/hotel/api/keys'

import { favoriteKeys } from '../keys'
import { addFavorite } from '../requests/addFavorite'

export const addFavoriteMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (hotelId: number) => addFavorite(hotelId),
    onSuccess: async (_data, hotelId) => {
      await queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: hotelKeys.lists() })
      await queryClient.invalidateQueries({
        queryKey: hotelKeys.detail(hotelId),
      })
    },
  })
