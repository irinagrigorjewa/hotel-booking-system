import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { HotelGallery } from '@entities/hotel/ui/HotelGallery'
import { HotelMiniMap } from '@entities/hotel/ui/HotelMiniMap'
import type { HotelImage } from '@entities/hotel/model/types'
import { radius } from '@shared/theme/tokens'

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
    <Box sx={{ mb: 3 }}>
      <HotelGallery hotelName={hotelName} images={images} />
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: `${radius.md}px`,
          mb: 1,
          overflow: 'hidden',
        }}
      >
        <HotelMiniMap
          hotelId={hotelId}
          latitude={String(latitude)}
          longitude={String(longitude)}
          name={hotelName}
        />
      </Box>
      <Typography color="text.secondary" variant="body2">
        {t('hotels.coordinates', { lat: latitude, lng: longitude })}
      </Typography>
    </Box>
  )
}
