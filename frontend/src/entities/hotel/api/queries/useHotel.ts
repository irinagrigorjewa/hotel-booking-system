import { useQuery } from '@tanstack/react-query'

import { hotelQueryOptions } from './hotelQueryOptions'

export const useHotel = (hotelId: number) => useQuery(hotelQueryOptions(hotelId))
