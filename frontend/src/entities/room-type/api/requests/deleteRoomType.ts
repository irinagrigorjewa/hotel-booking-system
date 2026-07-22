import { apiClient } from '@shared/api/client'

export const deleteRoomType = async (roomTypeId: number): Promise<void> => {
  await apiClient.delete(`/room-types/${roomTypeId}`)
}
