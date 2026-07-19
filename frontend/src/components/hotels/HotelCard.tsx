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

interface HotelCardProps {
  hotel: HotelListItem
}

export const HotelCard = ({ hotel }: HotelCardProps) => (
  <Card component="article" variant="outlined">
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
