import { apiClient } from './client'
import type { Room, RoomListParams, RoomPage, RoomWritePayload } from '../types/room'

const buildListParams = (
  params: RoomListParams,
): Record<string, string | number> => {
  const query: Record<string, string | number> = {}

  if (params.hotel_id !== undefined) {
    query.hotel_id = params.hotel_id
  }
  if (params.city?.trim()) {
    query.city = params.city.trim()
  }
  if (params.capacity !== undefined) {
    query.capacity = params.capacity
  }
  if (params.price_from !== undefined) {
    query.price_from = params.price_from
  }
  if (params.price_to !== undefined) {
    query.price_to = params.price_to
  }
  if (params.date_from) {
    query.date_from = params.date_from
  }
  if (params.date_to) {
    query.date_to = params.date_to
  }
  if (params.page !== undefined) {
    query.page = params.page
  }
  if (params.size !== undefined) {
    query.size = params.size
  }

  return query
}

export const roomsApi = {
  list: async (params: RoomListParams = {}): Promise<RoomPage> => {
    const { data } = await apiClient.get<RoomPage>('/rooms', {
      params: buildListParams(params),
    })

    return data
  },

  getById: async (roomId: number): Promise<Room> => {
    const { data } = await apiClient.get<Room>(`/rooms/${roomId}`)

    return data
  },

  create: async (payload: RoomWritePayload): Promise<Room> => {
    const { data } = await apiClient.post<Room>('/rooms', payload)

    return data
  },

  update: async (roomId: number, payload: RoomWritePayload): Promise<Room> => {
    const { data } = await apiClient.put<Room>(`/rooms/${roomId}`, payload)

    return data
  },

  remove: async (roomId: number): Promise<void> => {
    await apiClient.delete(`/rooms/${roomId}`)
  },
}
