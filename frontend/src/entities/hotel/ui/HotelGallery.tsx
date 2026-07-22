import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { HotelImage } from '@entities/hotel/model/types'
import { mediaUrl } from '@shared/lib/mediaUrl'

interface HotelGalleryProps {
  images: HotelImage[]
  hotelName: string
}

export const HotelGallery = ({ images, hotelName }: HotelGalleryProps) => {
  const { t } = useTranslation()

  if (images.length === 0) {
    return null
  }

  return (
    <Box
      aria-label={t('hotels.gallery.ariaLabel')}
      sx={{
        display: 'grid',
        gap: 1,
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        mb: 3,
      }}
    >
      {images.map((image) => {
        const src = mediaUrl(image.url)

        if (!src) {
          return null
        }

        return (
          <Box
            alt={t('hotels.gallery.photoAlt', {
              hotelName,
              order: image.sort_order,
            })}
            component="img"
            key={image.id}
            src={src}
            sx={{ borderRadius: 1, maxHeight: 240, objectFit: 'cover', width: '100%' }}
          />
        )
      })}
    </Box>
  )
}
