import { apiClient } from './client'
import type { RoomType, RoomTypePage, RoomTypeWritePayload } from '../types/roomType'

export const roomTypesApi = {
  list: async (page = 1, size = 100): Promise<RoomTypePage> => {
    const { data } = await apiClient.get<RoomTypePage>('/room-types', {
      params: { page, size },
    })

    return data
  },

  create: async (payload: RoomTypeWritePayload): Promise<RoomType> => {
    const { data } = await apiClient.post<RoomType>('/room-types', payload)

    return data
  },

  update: async (
    roomTypeId: number,
    payload: RoomTypeWritePayload,
  ): Promise<RoomType> => {
    const { data } = await apiClient.put<RoomType>(
      `/room-types/${roomTypeId}`,
      payload,
    )

    return data
  },

  remove: async (roomTypeId: number): Promise<void> => {
    await apiClient.delete(`/room-types/${roomTypeId}`)
  },
}
