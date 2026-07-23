import { Box, Rating, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { FavoriteButton } from '@features/favorite-toggle/ui/FavoriteButton'
import type { HotelDetail } from '@entities/hotel/model/types'
import { fonts } from '@shared/theme/tokens'

interface HotelDetailHeaderProps {
  hotel: HotelDetail
}

export const HotelDetailHeader = ({ hotel }: HotelDetailHeaderProps) => {
  const { t } = useTranslation()

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          gap: 1,
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography
          component="h1"
          sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.02em' }}
          variant="h4"
        >
          {hotel.name}
        </Typography>
        <FavoriteButton hotelId={hotel.id} isFavorite={hotel.is_favorite} />
      </Box>
      <Typography color="text.secondary" sx={{ mb: 1.5 }} variant="body2">
        {hotel.city}, {hotel.address}
      </Typography>
      <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Rating
          readOnly
          size="small"
          sx={{ color: 'rating.main' }}
          value={hotel.stars}
        />
        <Typography color="text.secondary" variant="body2">
          {t('hotels.starsCount', { count: hotel.stars })}
        </Typography>
        {hotel.avg_rating !== null ? (
          <Typography color="text.secondary" variant="body2">
            {t('hotels.reviewsSummary', {
              rating: hotel.avg_rating,
              count: hotel.reviews_count,
            })}
          </Typography>
        ) : null}
      </Box>
      {hotel.description ? (
        <Typography color="text.primary" sx={{ maxWidth: 720 }} variant="body1">
          {hotel.description}
        </Typography>
      ) : null}
    </Box>
  )
}
