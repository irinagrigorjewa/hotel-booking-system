import {
  Alert,
  Box,
  Button,
  Link,
  Rating,
  Skeleton,
  Typography,
} from '@mui/material'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom'

import {
  RoomFilters,
  type RoomFiltersValue,
} from '../components/hotels/RoomFilters'
import { FavoriteButton } from '../components/hotels/FavoriteButton'
import { HotelGallery } from '../components/hotels/HotelGallery'
import { HotelMiniMap } from '../components/hotels/HotelMiniMap'
import { HotelReviews } from '../components/hotels/HotelReviews'
import { RoomList } from '../components/hotels/RoomList'
import { useHotel } from '../hooks/useHotel'
import { useRooms } from '../hooks/useRooms'
import type { RoomListParams } from '../types/room'

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

export const HotelDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const hotelId = Number(id)
  const [searchParams, setSearchParams] = useSearchParams()
  const [draftFilters, setDraftFilters] = useState(() =>
    readFilters(searchParams),
  )
  const hotelQuery = useHotel(hotelId)
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
  const isNotFound =
    isAxiosError(hotelQuery.error) && hotelQuery.error.response?.status === 404

  if (!Number.isInteger(hotelId) || hotelId < 1) {
    return (
      <Alert severity="error">{t('hotels.invalidId')}</Alert>
    )
  }

  if (hotelQuery.isLoading) {
    return (
      <Box>
        <Skeleton height={48} width="60%" />
        <Skeleton height={24} sx={{ mt: 2 }} width="40%" />
        <Skeleton height={120} sx={{ mt: 3 }} />
      </Box>
    )
  }

  if (isNotFound) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('hotels.detailNotFound')}
        </Alert>
        <Link component={RouterLink} to="/hotels">
          {t('common.returnToCatalog')}
        </Link>
      </Box>
    )
  }

  if (hotelQuery.isError || !hotelQuery.data) {
    return (
      <Alert
        action={
          <Button
            color="inherit"
            onClick={() => {
              void hotelQuery.refetch()
            }}
            size="small"
          >
            {t('common.retry')}
          </Button>
        }
        severity="error"
      >
        {t('hotels.detailLoadFailed')}
      </Alert>
    )
  }

  const hotel = hotelQuery.data

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
    <Box>
      <Box
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          gap: 1,
          justifyContent: 'space-between',
        }}
      >
        <Typography component="h1" gutterBottom variant="h4">
          {hotel.name}
        </Typography>
        <FavoriteButton hotelId={hotel.id} isFavorite={hotel.is_favorite} />
      </Box>
      <Typography color="text.secondary" gutterBottom>
        {hotel.city}, {hotel.address}
      </Typography>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mb: 2 }}>
        <Rating readOnly value={hotel.stars} />
        <Typography>{t('hotels.starsCount', { count: hotel.stars })}</Typography>
        {hotel.avg_rating !== null ? (
          <Typography color="text.secondary">
            {t('hotels.reviewsSummary', {
              rating: hotel.avg_rating,
              count: hotel.reviews_count,
            })}
          </Typography>
        ) : null}
      </Box>
      {hotel.description ? (
        <Typography sx={{ mb: 2 }}>{hotel.description}</Typography>
      ) : null}
      <HotelGallery hotelName={hotel.name} images={hotel.images} />
      <HotelMiniMap
        hotelId={hotel.id}
        latitude={String(hotel.latitude)}
        longitude={String(hotel.longitude)}
        name={hotel.name}
      />
      <Typography color="text.secondary" sx={{ mb: 3 }} variant="body2">
        {t('hotels.coordinates', { lat: hotel.latitude, lng: hotel.longitude })}
      </Typography>
      <HotelReviews hotelId={hotel.id} />
      <Typography component="h2" gutterBottom variant="h5">
        {t('hotels.roomsSection')}
      </Typography>
      <RoomFilters
        onApply={applyFilters}
        onChange={setDraftFilters}
        value={draftFilters}
      />
      <RoomList
        isError={roomsQuery.isError}
        isLoading={roomsQuery.isLoading}
        onRetry={() => {
          void roomsQuery.refetch()
        }}
        rooms={roomsQuery.data?.items ?? []}
      />
      <Button component={RouterLink} sx={{ mt: 3 }} to="/hotels">
        {t('common.backToCatalog')}
      </Button>
    </Box>
  )
}
