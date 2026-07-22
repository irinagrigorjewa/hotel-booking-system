import { queryOptions } from '@tanstack/react-query'

import { roomKeys } from '../keys'
import { getRoom } from '../requests/getRoom'

export const roomQueryOptions = (roomId: number) =>
  queryOptions({
    queryKey: roomKeys.detail(roomId),
    queryFn: () => getRoom(roomId),
    enabled: Number.isInteger(roomId) && roomId > 0,
  })
