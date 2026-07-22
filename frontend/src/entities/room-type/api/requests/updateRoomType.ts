import { apiClient } from '@shared/api/client'

import type { RoomType, RoomTypeWritePayload } from '../../model/types'

export const updateRoomType = async (
  roomTypeId: number,
  payload: RoomTypeWritePayload,
): Promise<RoomType> => {
  const { data } = await apiClient.put<RoomType>(
    `/room-types/${roomTypeId}`,
    payload,
  )

  return data
}
