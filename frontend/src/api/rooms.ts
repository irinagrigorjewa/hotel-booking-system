import { createRoom } from '@entities/room/api/requests/createRoom'
import { deleteRoom } from '@entities/room/api/requests/deleteRoom'
import { getRoom } from '@entities/room/api/requests/getRoom'
import { listRooms } from '@entities/room/api/requests/listRooms'
import { updateRoom } from '@entities/room/api/requests/updateRoom'

/** @deprecated Prefer `@entities/room/api/requests/*` */
export const roomsApi = {
  list: listRooms,
  getById: getRoom,
  create: createRoom,
  update: updateRoom,
  remove: deleteRoom,
}
