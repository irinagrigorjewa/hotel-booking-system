import { useQuery } from '@tanstack/react-query'

import { roomsApi } from '../api/rooms'

export const roomQueryKey = (roomId: number) => ['room', roomId] as const

export const useRoom = (roomId: number) =>
  useQuery({
    queryKey: roomQueryKey(roomId),
    queryFn: () => roomsApi.getById(roomId),
    enabled: Number.isInteger(roomId) && roomId > 0,
  })
