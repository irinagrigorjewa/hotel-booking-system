import type { FavoriteListParams } from '../model/types'

export const favoriteKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoriteKeys.all, 'list'] as const,
  list: (params: FavoriteListParams = {}) =>
    [
      ...favoriteKeys.lists(),
      { page: params.page ?? 1, size: params.size ?? 20 },
    ] as const,
}
