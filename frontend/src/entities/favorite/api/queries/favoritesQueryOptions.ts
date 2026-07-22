import { queryOptions } from '@tanstack/react-query'

import { favoriteKeys } from '../keys'
import { listFavorites } from '../requests/listFavorites'

export const favoritesQueryOptions = (page = 1, size = 20) =>
  queryOptions({
    queryKey: favoriteKeys.list({ page, size }),
    queryFn: () => listFavorites(page, size),
  })
