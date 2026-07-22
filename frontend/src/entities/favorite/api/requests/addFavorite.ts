import { apiClient } from '@shared/api/client'

import type { FavoriteCreated } from '../../model/types'

export const addFavorite = async (hotelId: number): Promise<FavoriteCreated> => {
  const { data } = await apiClient.post<FavoriteCreated>(`/favorites/${hotelId}`)

  return data
}
