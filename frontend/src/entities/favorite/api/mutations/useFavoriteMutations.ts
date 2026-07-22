import { useMutation, useQueryClient } from '@tanstack/react-query'

import { addFavoriteMutationOptions } from './addFavoriteMutationOptions'
import { removeFavoriteMutationOptions } from './removeFavoriteMutationOptions'

export const useFavoriteMutations = () => {
  const queryClient = useQueryClient()

  const addFavorite = useMutation(addFavoriteMutationOptions(queryClient))
  const removeFavorite = useMutation(removeFavoriteMutationOptions(queryClient))

  return { addFavorite, removeFavorite }
}
