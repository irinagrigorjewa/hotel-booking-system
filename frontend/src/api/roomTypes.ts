import { createRoomType } from '@entities/room-type/api/requests/createRoomType'
import { deleteRoomType } from '@entities/room-type/api/requests/deleteRoomType'
import { listRoomTypes } from '@entities/room-type/api/requests/listRoomTypes'
import { updateRoomType } from '@entities/room-type/api/requests/updateRoomType'

/** @deprecated Prefer `@entities/room-type/api/requests/*` */
export const roomTypesApi = {
  list: listRoomTypes,
  create: createRoomType,
  update: updateRoomType,
  remove: deleteRoomType,
}
