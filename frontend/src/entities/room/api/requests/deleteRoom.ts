import { apiClient } from '@shared/api/client'

export const deleteRoom = async (roomId: number): Promise<void> => {
  await apiClient.delete(`/rooms/${roomId}`)
}
