import { addFavorite } from '@entities/favorite/api/requests/addFavorite'
import { listFavorites } from '@entities/favorite/api/requests/listFavorites'
import { removeFavorite } from '@entities/favorite/api/requests/removeFavorite'

/** @deprecated Prefer `@entities/favorite/api/requests/*` */
export const favoritesApi = {
  list: listFavorites,
  add: addFavorite,
  remove: removeFavorite,
}

export type { FavoriteCreated } from '@entities/favorite/model/types'
