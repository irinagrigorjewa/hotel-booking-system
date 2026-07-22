import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { HotelListParams, HotelSort } from '@entities/hotel/model/types'

import {
  parseHotelSort,
  parsePositiveInt,
  parseStarsFilter,
} from './parseFilters'

export const useHotelListSearchParams = (defaults: {
  page?: number
  size?: number
  sort?: HotelSort
}) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useMemo((): HotelListParams => {
    const city = searchParams.get('city')?.trim() || undefined
    const stars = parseStarsFilter(searchParams.get('stars'))
    const sort = parseHotelSort(searchParams.get('sort') ?? defaults.sort ?? null)
    const page = parsePositiveInt(searchParams.get('page'), defaults.page ?? 1)
    const size = parsePositiveInt(
      searchParams.get('size'),
      defaults.size ?? 20,
      100,
    )

    return { city, stars, sort, page, size }
  }, [defaults.page, defaults.size, defaults.sort, searchParams])

  const setFilters = useCallback(
    (next: {
      city?: string
      stars?: number | ''
      sort?: HotelSort
      page?: number
      size?: number
      resetPage?: boolean
    }): void => {
      const nextParams = new URLSearchParams(searchParams)
      const page = next.resetPage ? 1 : (next.page ?? params.page ?? 1)
      const city = next.city !== undefined ? next.city : (params.city ?? '')
      const stars =
        next.stars !== undefined
          ? next.stars
          : (params.stars ?? '')
      const sort = next.sort ?? params.sort ?? 'created_at'
      const size = next.size ?? params.size ?? 20

      if (city.trim()) {
        nextParams.set('city', city.trim())
      } else {
        nextParams.delete('city')
      }

      if (stars === '' || stars === undefined) {
        nextParams.delete('stars')
      } else {
        nextParams.set('stars', String(stars))
      }

      nextParams.set('sort', sort)
      nextParams.set('page', String(page))
      nextParams.set('size', String(size))
      setSearchParams(nextParams)
    },
    [params.city, params.page, params.size, params.stars, params.sort, searchParams, setSearchParams],
  )

  return { params, setFilters }
}
