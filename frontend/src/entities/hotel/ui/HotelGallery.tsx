import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { HotelImage } from '@entities/hotel/model/types'
import { mediaUrl } from '@shared/lib/mediaUrl'
import { radius } from '@shared/theme/tokens'

interface HotelGalleryProps {
  images: HotelImage[]
  hotelName: string
}

export const HotelGallery = ({ images, hotelName }: HotelGalleryProps) => {
  const { t } = useTranslation()

  if (images.length === 0) {
    return null
  }

  const [hero, ...rest] = images

  return (
    <Box
      aria-label={t('hotels.gallery.ariaLabel')}
      sx={{
        display: 'grid',
        gap: 1,
        gridTemplateColumns: {
          xs: '1fr',
          sm: rest.length > 0 ? '2fr 1fr' : '1fr',
        },
        mb: 2,
      }}
    >
      {hero ? (
        <GalleryImage
          hotelName={hotelName}
          image={hero}
          maxHeight={{ xs: 220, sm: 320 }}
        />
      ) : null}
      {rest.length > 0 ? (
        <Box sx={{ display: 'grid', gap: 1 }}>
          {rest.slice(0, 2).map((image) => (
            <GalleryImage
              hotelName={hotelName}
              image={image}
              key={image.id}
              maxHeight={{ xs: 140, sm: 156 }}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}

interface GalleryImageProps {
  image: HotelImage
  hotelName: string
  maxHeight: { xs: number; sm: number }
}

const GalleryImage = ({ image, hotelName, maxHeight }: GalleryImageProps) => {
  const { t } = useTranslation()
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
      src={src}
      sx={{
        borderRadius: `${radius.md}px`,
        height: maxHeight,
        objectFit: 'cover',
        width: '100%',
      }}
    />
  )
}
