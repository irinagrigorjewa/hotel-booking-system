import { apiClient } from '@shared/api/client'

import type { ImageOut } from '../../model/types'

export const uploadRoomImage = async (
  roomId: number,
  file: File,
  sortOrder = 0,
): Promise<ImageOut> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('sort_order', String(sortOrder))
  const { data } = await apiClient.post<ImageOut>(
    `/rooms/${roomId}/images`,
    formData,
  )

  return data
}
