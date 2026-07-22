import { useQuery } from '@tanstack/react-query'

import { roomTypesQueryOptions } from './roomTypesQueryOptions'

export const useRoomTypes = (page = 1, size = 100) =>
  useQuery(roomTypesQueryOptions(page, size))
