export { useHotels } from '@entities/hotel/api/queries/useHotels'
export { hotelKeys } from '@entities/hotel/api/keys'

import { hotelKeys } from '@entities/hotel/api/keys'
import type { HotelListParams } from '@entities/hotel/model/types'

/** @deprecated Prefer `hotelKeys.list` */
export const hotelsQueryKey = (params: HotelListParams) => hotelKeys.list(params)
