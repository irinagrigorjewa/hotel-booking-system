import { apiClient } from '@shared/api/client'

import type { HotelDetail, HotelWritePayload } from '../../model/types'

export const updateHotel = async (
  hotelId: number,
  payload: HotelWritePayload,
): Promise<HotelDetail> => {
  const { data } = await apiClient.put<HotelDetail>(
    `/hotels/${hotelId}`,
    payload,
  )

  return data
}
