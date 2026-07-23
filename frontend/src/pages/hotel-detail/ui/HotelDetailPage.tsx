import { Alert, Box, Button } from '@mui/material'
import { isAxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useParams } from 'react-router-dom'

import { useHotel } from '@entities/hotel/api/queries/useHotel'
import {
  HotelDetailGallery,
  HotelDetailHeader,
  HotelDetailQueryState,
  HotelDetailReviews,
  HotelDetailRooms,
} from '@widgets/hotel-detail'

export const HotelDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const hotelId = Number(id)
  const hotelQuery = useHotel(hotelId)
  const isNotFound =
    isAxiosError(hotelQuery.error) && hotelQuery.error.response?.status === 404

  if (!Number.isInteger(hotelId) || hotelId < 1) {
    return <Alert severity="error">{t('hotels.invalidId')}</Alert>
  }

  if (hotelQuery.isLoading) {
    return <HotelDetailQueryState status="loading" />
  }

  if (isNotFound) {
    return <HotelDetailQueryState status="notFound" />
  }

  if (hotelQuery.isError || !hotelQuery.data) {
    return (
      <HotelDetailQueryState
        onRetry={() => {
          void hotelQuery.refetch()
        }}
        status="error"
      />
    )
  }

  const hotel = hotelQuery.data

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
      <HotelDetailHeader hotel={hotel} />
      <HotelDetailGallery
        hotelId={hotel.id}
        hotelName={hotel.name}
        images={hotel.images}
        latitude={hotel.latitude}
        longitude={hotel.longitude}
      />
      <HotelDetailReviews hotelId={hotel.id} />
      <HotelDetailRooms hotelId={hotel.id} />
      <Button
        component={RouterLink}
        sx={{ alignSelf: 'flex-start' }}
        to="/hotels"
        variant="outlined"
      >
        {t('common.backToCatalog')}
      </Button>
    </Box>
  )
}
