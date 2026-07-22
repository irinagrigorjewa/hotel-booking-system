export { useFavorites } from '@entities/favorite/api/queries/useFavorites'
export { favoriteKeys } from '@entities/favorite/api/keys'

import { favoriteKeys } from '@entities/favorite/api/keys'

/** @deprecated Prefer `favoriteKeys.list` */
export const favoritesQueryKey = (page = 1, size = 20) =>
  favoriteKeys.list({ page, size })
