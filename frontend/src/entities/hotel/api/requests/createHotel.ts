import { apiClient } from '@shared/api/client'

import type { HotelDetail, HotelWritePayload } from '../../model/types'

export const createHotel = async (
  payload: HotelWritePayload,
): Promise<HotelDetail> => {
  const { data } = await apiClient.post<HotelDetail>('/hotels', payload)

  return data
}
