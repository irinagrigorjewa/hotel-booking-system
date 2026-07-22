import { apiClient } from '@shared/api/client'
import type { HotelPage } from '../types/hotel'

export interface FavoriteCreated {
  hotel_id: number
  user_id: number
  created_at: string
}

export const favoritesApi = {
  list: async (page = 1, size = 20): Promise<HotelPage> => {
    const { data } = await apiClient.get<HotelPage>('/favorites', {
      params: { page, size },
    })

    return data
  },

  add: async (hotelId: number): Promise<FavoriteCreated> => {
    const { data } = await apiClient.post<FavoriteCreated>(`/favorites/${hotelId}`)

    return data
  },

  remove: async (hotelId: number): Promise<void> => {
    await apiClient.delete(`/favorites/${hotelId}`)
  },
}
