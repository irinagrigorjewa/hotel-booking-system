import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import type { Room } from '../../types/room'

interface RoomListProps {
  rooms: Room[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export const RoomList = ({
  rooms,
  isLoading,
  isError,
  onRetry,
}: RoomListProps) => {
  const { user } = useAuth()

  if (isLoading) {
    return <Typography color="text.secondary">Загрузка номеров…</Typography>
  }

  if (isError) {
    return (
      <Alert
        action={
          <Button color="inherit" onClick={onRetry} size="small">
            Повторить
          </Button>
        }
        severity="error"
      >
        Не удалось загрузить номера
      </Alert>
    )
  }

  if (rooms.length === 0) {
    return (
      <Typography color="text.secondary">
        Подходящие номера не найдены
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {rooms.map((room) => {
        const bookTo = user
          ? `/bookings/new?room_id=${room.id}&hotel_id=${room.hotel_id}`
          : `/login?returnUrl=${encodeURIComponent(`/bookings/new?room_id=${room.id}&hotel_id=${room.hotel_id}`)}`

        return (
          <Card key={room.id} variant="outlined">
            <CardContent>
              <Typography component="h3" variant="h6">
                Номер {room.number} · {room.room_type.name}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {room.price} ₽ / ночь · до {room.capacity} гостей · {room.status}
              </Typography>
              {room.description ? (
                <Typography sx={{ mt: 1 }} variant="body2">
                  {room.description}
                </Typography>
              ) : null}
              {room.status === 'AVAILABLE' ? (
                <Button
                  component={RouterLink}
                  sx={{ mt: 2 }}
                  to={bookTo}
                  variant="contained"
                >
                  Забронировать
                </Button>
              ) : (
                <Typography color="warning.main" sx={{ mt: 2 }} variant="body2">
                  Номер на обслуживании
                </Typography>
              )}
            </CardContent>
          </Card>
        )
      })}
    </Box>
  )
}
