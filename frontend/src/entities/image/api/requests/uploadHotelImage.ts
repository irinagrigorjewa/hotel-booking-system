import { apiClient } from '@shared/api/client'

import type { ImageOut } from '../../model/types'

export const uploadHotelImage = async (
  hotelId: number,
  file: File,
  sortOrder = 0,
): Promise<ImageOut> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('sort_order', String(sortOrder))
  const { data } = await apiClient.post<ImageOut>(
    `/hotels/${hotelId}/images`,
    formData,
  )

  return data
}
