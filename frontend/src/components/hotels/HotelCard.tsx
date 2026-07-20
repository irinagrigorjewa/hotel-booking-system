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

import type { HotelListItem } from '../../types/hotel'
import { mediaUrl } from '../../utils/mediaUrl'
import { FavoriteButton } from './FavoriteButton'

interface HotelCardProps {
  hotel: HotelListItem
}

export const HotelCard = ({ hotel }: HotelCardProps) => {
  const { t } = useTranslation()
  const coverSrc = mediaUrl(hotel.cover_image)

  return (
    <Card
      component="article"
      sx={{
        height: '100%',
        position: 'relative',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: 6,
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
            height="140"
            image={coverSrc}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            aria-label={t('hotels.noPhoto')}
            sx={{
              alignItems: 'center',
              bgcolor: 'action.hover',
              color: 'text.secondary',
              display: 'flex',
              height: 140,
              justifyContent: 'center',
              px: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2">{t('hotels.noPhoto')}</Typography>
          </Box>
        )}
        <CardContent>
          <Typography component="h2" gutterBottom variant="h6">
            {hotel.name}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {hotel.city}
          </Typography>
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mt: 1 }}>
            <Rating readOnly size="small" value={hotel.stars} />
            <Typography variant="body2">{hotel.stars}</Typography>
          </Box>
          {hotel.avg_rating !== null ? (
            <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
              {t('hotels.cardRating', {
                rating: hotel.avg_rating,
                count: hotel.reviews_count,
              })}
            </Typography>
          ) : null}
          <Typography sx={{ mt: 1 }} variant="body2">
            {hotel.address}
          </Typography>
          {hotel.description ? (
            <Typography
              color="text.secondary"
              sx={{
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                display: '-webkit-box',
                mt: 1,
                overflow: 'hidden',
              }}
              variant="body2"
            >
              {hotel.description}
            </Typography>
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
