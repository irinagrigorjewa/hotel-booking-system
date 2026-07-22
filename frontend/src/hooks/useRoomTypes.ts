export { useRoomTypes } from '@entities/room-type/api/queries/useRoomTypes'
export { roomTypeKeys } from '@entities/room-type/api/keys'

import { roomTypeKeys } from '@entities/room-type/api/keys'

/** @deprecated Prefer `roomTypeKeys.list` */
export const roomTypesQueryKey = (page = 1, size = 100) =>
  roomTypeKeys.list(page, size)
