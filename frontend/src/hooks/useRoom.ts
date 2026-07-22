export { useRoom } from '@entities/room/api/queries/useRoom'
export { roomKeys } from '@entities/room/api/keys'

import { roomKeys } from '@entities/room/api/keys'

/** @deprecated Prefer `roomKeys.detail` */
export const roomQueryKey = (roomId: number) => roomKeys.detail(roomId)
