import { apiClient } from '@shared/api/client'

import type { Room } from '../../model/types'

export const getRoom = async (roomId: number): Promise<Room> => {
  const { data } = await apiClient.get<Room>(`/rooms/${roomId}`)

  return data
}
