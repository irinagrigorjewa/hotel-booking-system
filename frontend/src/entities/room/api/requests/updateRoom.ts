import { apiClient } from '@shared/api/client'

import type { Room, RoomWritePayload } from '../../model/types'

export const updateRoom = async (
  roomId: number,
  payload: RoomWritePayload,
): Promise<Room> => {
  const { data } = await apiClient.put<Room>(`/rooms/${roomId}`, payload)

  return data
}
