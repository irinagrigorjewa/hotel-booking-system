import { apiClient } from '@shared/api/client'

import type { Room, RoomWritePayload } from '../../model/types'

export const createRoom = async (payload: RoomWritePayload): Promise<Room> => {
  const { data } = await apiClient.post<Room>('/rooms', payload)

  return data
}
