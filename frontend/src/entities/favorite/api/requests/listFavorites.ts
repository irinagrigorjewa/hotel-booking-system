import { apiClient } from '@shared/api/client'
import type { HotelPage } from '@entities/hotel/model/types'

export const listFavorites = async (
  page = 1,
  size = 20,
): Promise<HotelPage> => {
  const { data } = await apiClient.get<HotelPage>('/favorites', {
    params: { page, size },
  })

  return data
}
