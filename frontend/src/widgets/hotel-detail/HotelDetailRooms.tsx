import { Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import {
  RoomFilters,
  type RoomFiltersValue,
} from '../../components/hotels/RoomFilters'
import { RoomList } from '../../components/hotels/RoomList'
import { useRooms } from '../../hooks/useRooms'
import type { RoomListParams } from '../../types/room'

interface HotelDetailRoomsProps {
  hotelId: number
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

export const HotelDetailRooms = ({ hotelId }: HotelDetailRoomsProps) => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [draftFilters, setDraftFilters] = useState(() =>
    readFilters(searchParams),
  )
  const roomParams: RoomListParams = {
    hotel_id: hotelId,
    capacity: parsePositive(searchParams.get('capacity') ?? ''),
    price_from: parsePositive(searchParams.get('price_from') ?? ''),
    price_to: parsePositive(searchParams.get('price_to') ?? ''),
    date_from: searchParams.get('date_from') || undefined,
    date_to: searchParams.get('date_to') || undefined,
    page: 1,
    size: 50,
  }
  const roomsQuery = useRooms(roomParams)

  const applyFilters = (): void => {
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
  }

  return (
    <>
      <Typography component="h2" gutterBottom variant="h5">
        {t('hotels.roomsSection')}
      </Typography>
      <RoomFilters
        onApply={applyFilters}
        onChange={setDraftFilters}
        value={draftFilters}
      />
      <RoomList
        dateFrom={searchParams.get('date_from') || undefined}
        dateTo={searchParams.get('date_to') || undefined}
        isError={roomsQuery.isError}
        isLoading={roomsQuery.isLoading}
        onRetry={() => {
          void roomsQuery.refetch()
        }}
        rooms={roomsQuery.data?.items ?? []}
      />
    </>
  )
}
