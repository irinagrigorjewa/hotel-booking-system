import { apiClient } from '@shared/api/client'

export const removeFavorite = async (hotelId: number): Promise<void> => {
  await apiClient.delete(`/favorites/${hotelId}`)
}
