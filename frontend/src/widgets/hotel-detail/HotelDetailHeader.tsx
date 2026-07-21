import { Box, Rating, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { FavoriteButton } from '../../components/hotels/FavoriteButton'
import type { HotelDetail } from '../../types/hotel'

interface HotelDetailHeaderProps {
  hotel: HotelDetail
}

export const HotelDetailHeader = ({ hotel }: HotelDetailHeaderProps) => {
  const { t } = useTranslation()

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
    </Box>
  )
}
