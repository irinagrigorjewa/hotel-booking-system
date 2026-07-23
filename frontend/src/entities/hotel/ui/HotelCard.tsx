import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import type { HotelListItem } from '@entities/hotel/model/types'
import { FavoriteButton } from '@features/favorite-toggle/ui/FavoriteButton'
import { mediaUrl } from '@shared/lib/mediaUrl'
import { elevation, fonts, radius } from '@shared/theme/tokens'

interface HotelCardProps {
  hotel: HotelListItem
}

const COVER_HEIGHT = 200

export const HotelCard = ({ hotel }: HotelCardProps) => {
  const { t } = useTranslation()
  const coverSrc = mediaUrl(hotel.cover_image)

  return (
    <Card
      component="article"
      sx={{
        borderRadius: `${radius.md}px`,
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: elevation[2],
          transform: 'translateY(-2px)',
        },
      }}
      variant="outlined"
    >
      <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
        <FavoriteButton hotelId={hotel.id} isFavorite={hotel.is_favorite} />
      </Box>
      <CardActionArea component={RouterLink} sx={{ height: '100%' }} to={`/hotels/${hotel.id}`}>
        {coverSrc ? (
          <CardMedia
            alt={hotel.name}
            component="img"
            height={COVER_HEIGHT}
            image={coverSrc}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            aria-label={t('hotels.noPhoto')}
            sx={{
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'text.secondary',
              display: 'flex',
              height: COVER_HEIGHT,
              justifyContent: 'center',
              px: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2">{t('hotels.noPhoto')}</Typography>
          </Box>
        )}
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, p: 2 }}>
          {hotel.min_price !== null ? (
            <Typography
              component="p"
              sx={{
                color: 'text.primary',
                fontFamily: fonts.display,
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                m: 0,
              }}
              variant="h6"
            >
              {t('common.fromPrice', { price: hotel.min_price })}
            </Typography>
          ) : null}
          <Typography
            component="h2"
            sx={{
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              display: '-webkit-box',
              fontFamily: fonts.display,
              fontWeight: 600,
              lineHeight: 1.3,
              overflow: 'hidden',
            }}
            variant="subtitle1"
          >
            {hotel.name}
          </Typography>
          <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            <Typography color="text.secondary" variant="body2">
              {hotel.city}
            </Typography>
            <Rating
              readOnly
              size="small"
              sx={{ color: 'rating.main', '& .MuiRating-iconEmpty': { color: 'divider' } }}
              value={hotel.stars}
            />
          </Box>
          {hotel.avg_rating !== null ? (
            <Typography color="text.secondary" variant="body2">
              {t('hotels.cardRating', {
                rating: hotel.avg_rating,
                count: hotel.reviews_count,
              })}
            </Typography>
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
