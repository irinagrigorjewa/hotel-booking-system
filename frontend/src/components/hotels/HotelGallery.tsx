import { Box } from '@mui/material'

import type { HotelImage } from '../../types/hotel'
import { mediaUrl } from '../../utils/mediaUrl'

interface HotelGalleryProps {
  images: HotelImage[]
  hotelName: string
}

export const HotelGallery = ({ images, hotelName }: HotelGalleryProps) => {
  if (images.length === 0) {
    return null
  }

  return (
    <Box
      aria-label="Галерея отеля"
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
            alt={`${hotelName} фото ${image.sort_order}`}
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
