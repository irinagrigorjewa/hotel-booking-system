export { useHotelsMap } from '@entities/hotel/api/queries/useHotelsMap'
export { hotelKeys } from '@entities/hotel/api/keys'

import { hotelKeys } from '@entities/hotel/api/keys'

/** @deprecated Prefer `hotelKeys.map` */
export const hotelsMapQueryKey = (city?: string) => hotelKeys.map(city)
