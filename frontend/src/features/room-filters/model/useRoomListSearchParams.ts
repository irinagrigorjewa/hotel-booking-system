import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { RoomListParams } from '@entities/room/model/types'

export interface RoomFiltersValue {
  capacity: string
  price_from: string
  price_to: string
  date_from: string
  date_to: string
}

const parsePositive = (value: string): number | undefined => {
  if (!value.trim()) {
    return undefined
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

const readFilters = (searchParams: URLSearchParams): RoomFiltersValue => ({
  capacity: searchParams.get('capacity') ?? '',
  price_from: searchParams.get('price_from') ?? '',
  price_to: searchParams.get('price_to') ?? '',
  date_from: searchParams.get('date_from') ?? '',
  date_to: searchParams.get('date_to') ?? '',
})

export const useRoomListSearchParams = (hotelId: number) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [draftFilters, setDraftFilters] = useState(() =>
    readFilters(searchParams),
  )

  const roomParams: RoomListParams = useMemo(
    () => ({
      hotel_id: hotelId,
      capacity: parsePositive(searchParams.get('capacity') ?? ''),
      price_from: parsePositive(searchParams.get('price_from') ?? ''),
      price_to: parsePositive(searchParams.get('price_to') ?? ''),
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      page: 1,
      size: 50,
    }),
    [hotelId, searchParams],
  )

  const applyFilters = useCallback((): void => {
    const next = new URLSearchParams()
    if (draftFilters.capacity) {
      next.set('capacity', draftFilters.capacity)
    }
    if (draftFilters.price_from) {
      next.set('price_from', draftFilters.price_from)
    }
    if (draftFilters.price_to) {
      next.set('price_to', draftFilters.price_to)
    }
    if (draftFilters.date_from) {
      next.set('date_from', draftFilters.date_from)
    }
    if (draftFilters.date_to) {
      next.set('date_to', draftFilters.date_to)
    }
    setSearchParams(next)
  }, [draftFilters, setSearchParams])

  return {
    draftFilters,
    setDraftFilters,
    applyFilters,
    roomParams,
    dateFrom: searchParams.get('date_from') || undefined,
    dateTo: searchParams.get('date_to') || undefined,
  }
}
