import {
  Alert,
  Box,
  Button,
  Link,
  Rating,
  Skeleton,
  Typography,
} from '@mui/material'
import { isAxiosError } from 'axios'
import { Link as RouterLink, useParams } from 'react-router-dom'

import { useHotel } from '../hooks/useHotel'

export const HotelDetailPage = () => {
  const { id } = useParams()
  const hotelId = Number(id)
  const hotelQuery = useHotel(hotelId)
  const isNotFound =
    isAxiosError(hotelQuery.error) && hotelQuery.error.response?.status === 404

  if (!Number.isInteger(hotelId) || hotelId < 1) {
    return (
      <Alert severity="error">Некорректный идентификатор отеля</Alert>
    )
  }

  if (hotelQuery.isLoading) {
    return (
      <Box>
        <Skeleton height={48} width="60%" />
        <Skeleton height={24} sx={{ mt: 2 }} width="40%" />
        <Skeleton height={120} sx={{ mt: 3 }} />
      </Box>
    )
  }

  if (isNotFound) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Отель не найден
        </Alert>
        <Link component={RouterLink} to="/hotels">
          Вернуться в каталог
        </Link>
      </Box>
    )
  }

  if (hotelQuery.isError || !hotelQuery.data) {
    return (
      <Alert
        action={
          <Button
            color="inherit"
            onClick={() => {
              void hotelQuery.refetch()
            }}
            size="small"
          >
            Повторить
          </Button>
        }
        severity="error"
      >
        Не удалось загрузить отель
      </Alert>
    )
  }

  const hotel = hotelQuery.data

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        {hotel.name}
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        {hotel.city}, {hotel.address}
      </Typography>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mb: 2 }}>
        <Rating readOnly value={hotel.stars} />
        <Typography>{hotel.stars} звёзд</Typography>
      </Box>
      {hotel.description ? (
        <Typography sx={{ mb: 2 }}>{hotel.description}</Typography>
      ) : null}
      <Typography color="text.secondary" variant="body2">
        Координаты: {hotel.latitude}, {hotel.longitude}
      </Typography>
      <Button component={RouterLink} sx={{ mt: 3 }} to="/hotels">
        Назад к каталогу
      </Button>
    </Box>
  )
}
