import { useQuery } from '@tanstack/react-query'

import { favoritesApi } from '../api/favorites'

export const favoritesQueryKey = (page = 1, size = 20) =>
  ['favorites', { page, size }] as const

export const useFavorites = (page = 1, size = 20) =>
  useQuery({
    queryKey: favoritesQueryKey(page, size),
    queryFn: () => favoritesApi.list(page, size),
  })
