import { queryOptions } from '@tanstack/react-query'

import { roomTypeKeys } from '../keys'
import { listRoomTypes } from '../requests/listRoomTypes'

export const roomTypesQueryOptions = (page = 1, size = 100) =>
  queryOptions({
    queryKey: roomTypeKeys.list(page, size),
    queryFn: () => listRoomTypes(page, size),
  })
