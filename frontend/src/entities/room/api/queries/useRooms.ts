import { useQuery } from '@tanstack/react-query'

import type { RoomListParams } from '../../model/types'
import { roomsQueryOptions } from './roomsQueryOptions'

export const useRooms = (params: RoomListParams) =>
  useQuery(roomsQueryOptions(params))
