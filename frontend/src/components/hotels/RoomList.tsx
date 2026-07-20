import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import type { Room } from '../../types/room'

interface RoomListProps {
  rooms: Room[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  dateFrom?: string
  dateTo?: string
}

const buildBookPath = (
  room: Room,
  dateFrom?: string,
  dateTo?: string,
): string => {
  const params = new URLSearchParams({
    room_id: String(room.id),
    hotel_id: String(room.hotel_id),
  })
  if (dateFrom) {
    params.set('date_from', dateFrom)
  }
  if (dateTo) {
    params.set('date_to', dateTo)
  }

  return `/bookings/new?${params.toString()}`
}

export const RoomList = ({
  rooms,
  isLoading,
  isError,
  onRetry,
  dateFrom,
  dateTo,
}: RoomListProps) => {
  const { t } = useTranslation()
  const { user } = useAuth()

  if (isLoading) {
    return <Typography color="text.secondary">{t('hotels.roomsLoading')}</Typography>
  }

  if (isError) {
    return (
      <Alert
        action={
          <Button color="inherit" onClick={onRetry} size="small">
            {t('common.retry')}
          </Button>
        }
        severity="error"
      >
        {t('hotels.roomsLoadFailed')}
      </Alert>
    )
  }

  if (rooms.length === 0) {
    return (
      <Typography color="text.secondary">{t('hotels.noMatchingRooms')}</Typography>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {rooms.map((room) => {
        const bookPath = buildBookPath(room, dateFrom, dateTo)
        const bookTo = user
          ? bookPath
          : `/login?returnUrl=${encodeURIComponent(bookPath)}`

        return (
          <Card key={room.id} variant="outlined">
            <CardContent>
              <Typography component="h3" variant="h6">
                {t('hotels.roomTitle', {
                  number: room.number,
                  type: room.room_type.name,
                })}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {t('hotels.roomPriceLine', {
                  price: room.price,
                  capacity: room.capacity,
                  status: room.status,
                })}
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
                  {t('hotels.book')}
                </Button>
              ) : (
                <Typography color="warning.main" sx={{ mt: 2 }} variant="body2">
                  {t('hotels.roomMaintenance')}
                </Typography>
              )}
            </CardContent>
          </Card>
        )
      })}
    </Box>
  )
}
