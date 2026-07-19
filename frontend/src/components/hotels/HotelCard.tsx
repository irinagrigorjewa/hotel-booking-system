import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import type { HotelListItem } from '../../types/hotel'
import { FavoriteButton } from './FavoriteButton'

interface HotelCardProps {
  hotel: HotelListItem
}

export const HotelCard = ({ hotel }: HotelCardProps) => (
  <Card component="article" sx={{ position: 'relative' }} variant="outlined">
    <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
      <FavoriteButton hotelId={hotel.id} isFavorite={hotel.is_favorite} />
    </Box>
    <CardActionArea component={RouterLink} to={`/hotels/${hotel.id}`}>
      {hotel.cover_image ? (
        <CardMedia
          alt={hotel.name}
          component="img"
          height="140"
          image={hotel.cover_image}
        />
      ) : null}
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
            Рейтинг: {hotel.avg_rating} ({hotel.reviews_count})
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
