import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useBookingMutations } from '../hooks/useBookingMutations'
import { useBookings } from '../hooks/useBookings'
import type { Booking } from '../types/booking'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

const canCancel = (status: Booking['status']): boolean =>
  status === 'PENDING' || status === 'CONFIRMED'

export const ProfilePage = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const showBookings = searchParams.get('tab') !== 'account'
  const { data, isLoading, isError } = useBookings({ page: 1, size: 50 })
  const { cancelBooking } = useBookingMutations()
  const [actionError, setActionError] = useState('')
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const handleCancel = async (bookingId: number): Promise<void> => {
    if (!window.confirm('Отменить бронирование?')) {
      return
    }

    setActionError('')
    setCancellingId(bookingId)

    try {
      await cancelBooking.mutateAsync(bookingId)
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Не удалось отменить бронирование'))
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        Профиль
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {user?.name} · {user?.email}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button
          component={RouterLink}
          to="/profile?tab=bookings"
          variant={showBookings ? 'contained' : 'outlined'}
        >
          Бронирования
        </Button>
      </Stack>
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      ) : null}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : null}
      {isError ? (
        <Alert severity="error">Не удалось загрузить бронирования.</Alert>
      ) : null}
      {data && data.items.length === 0 ? (
        <Alert severity="info">У вас пока нет бронирований.</Alert>
      ) : null}
      {data && data.items.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Отель</TableCell>
              <TableCell>Номер</TableCell>
              <TableCell>Даты</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {data.items.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.room.hotel_name}</TableCell>
                <TableCell>{booking.room.number}</TableCell>
                <TableCell>
                  {booking.check_in} → {booking.check_out} ({booking.nights} н.)
                </TableCell>
                <TableCell>{booking.total_price} ₽</TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell align="right">
                  {canCancel(booking.status) ? (
                    <Button
                      disabled={cancellingId === booking.id}
                      onClick={() => void handleCancel(booking.id)}
                      size="small"
                    >
                      Отменить
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </Box>
  )
}
