import type { HotelSort } from '@entities/hotel/model/types'

const SORT_VALUES: HotelSort[] = ['created_at', 'stars', 'avg_rating']

export const parseStarsFilter = (value: string | null): number | undefined => {
  if (!value) {
    return undefined
  }

  const stars = Number(value)

  return stars >= 1 && stars <= 5 ? stars : undefined
}

export const parseStarsSelect = (value: string): number | '' =>
  value === '' ? '' : Number(value)

export const parseHotelSort = (value: string | null): HotelSort =>
  SORT_VALUES.includes(value as HotelSort) ? (value as HotelSort) : 'created_at'

export const parsePositiveInt = (
  value: string | null,
  fallback: number,
  max?: number,
): number => {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }

  if (max !== undefined && parsed > max) {
    return max
  }

  return parsed
}
