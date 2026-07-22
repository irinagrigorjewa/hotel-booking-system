import { useQuery } from '@tanstack/react-query'

import { favoritesQueryOptions } from './favoritesQueryOptions'

export const useFavorites = (page = 1, size = 20) =>
  useQuery(favoritesQueryOptions(page, size))
