import { apiClient } from '@shared/api/client'

import type { RoomTypePage } from '../../model/types'

export const listRoomTypes = async (
  page = 1,
  size = 100,
): Promise<RoomTypePage> => {
  const { data } = await apiClient.get<RoomTypePage>('/room-types', {
    params: { page, size },
  })

  return data
}
