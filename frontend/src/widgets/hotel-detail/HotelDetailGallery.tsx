import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { HotelGallery } from '@entities/hotel/ui/HotelGallery'
import { HotelMiniMap } from '@entities/hotel/ui/HotelMiniMap'
import type { HotelImage } from '@entities/hotel/model/types'

interface HotelDetailGalleryProps {
  hotelId: number
  hotelName: string
  images: HotelImage[]
  latitude: string | number
  longitude: string | number
}

export const HotelDetailGallery = ({
  hotelId,
  hotelName,
  images,
  latitude,
  longitude,
}: HotelDetailGalleryProps) => {
  const { t } = useTranslation()

  return (
    <>
      <HotelGallery hotelName={hotelName} images={images} />
      <HotelMiniMap
        hotelId={hotelId}
        latitude={String(latitude)}
        longitude={String(longitude)}
        name={hotelName}
      />
      <Typography color="text.secondary" sx={{ mb: 3 }} variant="body2">
        {t('hotels.coordinates', { lat: latitude, lng: longitude })}
      </Typography>
    </>
  )
}
