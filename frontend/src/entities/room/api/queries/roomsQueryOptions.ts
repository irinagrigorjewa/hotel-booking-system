import { queryOptions } from '@tanstack/react-query'

import type { RoomListParams } from '../../model/types'
import { roomKeys } from '../keys'
import { listRooms } from '../requests/listRooms'

export const roomsQueryOptions = (params: RoomListParams) =>
  queryOptions({
    queryKey: roomKeys.list(params),
    queryFn: () => listRooms(params),
  })
