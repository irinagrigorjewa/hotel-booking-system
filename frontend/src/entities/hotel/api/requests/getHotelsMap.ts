import { apiClient } from '@shared/api/client'

import type { HotelMapResponse } from '../../model/map-types'

export const getHotelsMap = async (city?: string): Promise<HotelMapResponse> => {
  const { data } = await apiClient.get<HotelMapResponse>('/hotels/map', {
    params: city?.trim() ? { city: city.trim() } : undefined,
  })

  return data
}
