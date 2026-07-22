import { apiClient } from '@shared/api/client'

import type { HotelDetail } from '../../model/types'

export const getHotel = async (hotelId: number): Promise<HotelDetail> => {
  const { data } = await apiClient.get<HotelDetail>(`/hotels/${hotelId}`)

  return data
}
