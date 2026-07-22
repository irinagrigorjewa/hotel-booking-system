import { createHotel } from '@entities/hotel/api/requests/createHotel'
import { deleteHotel } from '@entities/hotel/api/requests/deleteHotel'
import { getHotel } from '@entities/hotel/api/requests/getHotel'
import { getHotelsMap } from '@entities/hotel/api/requests/getHotelsMap'
import { listHotels } from '@entities/hotel/api/requests/listHotels'
import { updateHotel } from '@entities/hotel/api/requests/updateHotel'

/** @deprecated Prefer `@entities/hotel/api/requests/*` */
export const hotelsApi = {
  list: listHotels,
  getById: getHotel,
  getMap: getHotelsMap,
  create: createHotel,
  update: updateHotel,
  remove: deleteHotel,
}
