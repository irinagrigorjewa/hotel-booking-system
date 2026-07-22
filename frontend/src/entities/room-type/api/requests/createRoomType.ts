import { apiClient } from '@shared/api/client'

import type { RoomType, RoomTypeWritePayload } from '../../model/types'

export const createRoomType = async (
  payload: RoomTypeWritePayload,
): Promise<RoomType> => {
  const { data } = await apiClient.post<RoomType>('/room-types', payload)

  return data
}
