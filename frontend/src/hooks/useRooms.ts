import { useQuery } from '@tanstack/react-query'

import { roomsApi } from '../api/rooms'
import type { RoomListParams } from '../types/room'

export const roomsQueryKey = (params: RoomListParams) =>
  ['rooms', params] as const

export const useRooms = (params: RoomListParams) =>
  useQuery({
    queryKey: roomsQueryKey(params),
    queryFn: () => roomsApi.list(params),
  })
