export { useHotel } from '@entities/hotel/api/queries/useHotel'
export { hotelKeys } from '@entities/hotel/api/keys'

import { hotelKeys } from '@entities/hotel/api/keys'

/** @deprecated Prefer `hotelKeys.detail` */
export const hotelQueryKey = (hotelId: number) => hotelKeys.detail(hotelId)
