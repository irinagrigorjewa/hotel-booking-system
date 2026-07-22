export { useRooms } from '@entities/room/api/queries/useRooms'
export { roomKeys } from '@entities/room/api/keys'

import { roomKeys } from '@entities/room/api/keys'
import type { RoomListParams } from '@entities/room/model/types'

/** @deprecated Prefer `roomKeys.list` */
export const roomsQueryKey = (params: RoomListParams) => roomKeys.list(params)
