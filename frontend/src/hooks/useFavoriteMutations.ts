import { useMutation, useQueryClient } from '@tanstack/react-query'

import { hotelKeys } from '@entities/hotel/api/keys'

import { favoritesApi } from '../api/favorites'

export const useFavoriteMutations = () => {
  const queryClient = useQueryClient()

  const invalidate = async (hotelId?: number): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['favorites'] })
    await queryClient.invalidateQueries({ queryKey: hotelKeys.all })
    if (hotelId !== undefined) {
      await queryClient.invalidateQueries({
        queryKey: hotelKeys.detail(hotelId),
      })
    }
  }

  const addFavorite = useMutation({
    mutationFn: (hotelId: number) => favoritesApi.add(hotelId),
    onSuccess: async (_data, hotelId) => {
      await invalidate(hotelId)
    },
  })

  const removeFavorite = useMutation({
    mutationFn: (hotelId: number) => favoritesApi.remove(hotelId),
    onSuccess: async (_data, hotelId) => {
      await invalidate(hotelId)
    },
  })

  return { addFavorite, removeFavorite }
}
