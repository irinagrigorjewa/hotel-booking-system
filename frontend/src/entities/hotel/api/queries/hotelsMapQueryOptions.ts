import { queryOptions } from '@tanstack/react-query'

import { hotelKeys } from '../keys'
import { getHotelsMap } from '../requests/getHotelsMap'

export const hotelsMapQueryOptions = (city?: string) =>
  queryOptions({
    queryKey: hotelKeys.map(city),
    queryFn: () => getHotelsMap(city),
  })
