import { useQuery } from '@tanstack/react-query'

import { roomTypesApi } from '../api/roomTypes'

export const roomTypesQueryKey = (page = 1, size = 100) =>
  ['room-types', { page, size }] as const

export const useRoomTypes = (page = 1, size = 100) =>
  useQuery({
    queryKey: roomTypesQueryKey(page, size),
    queryFn: () => roomTypesApi.list(page, size),
  })
