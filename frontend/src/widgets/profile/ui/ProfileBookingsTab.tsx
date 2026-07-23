import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import { canCancelBooking } from '@entities/booking/model/rules'
import type { Booking } from '@entities/booking/model/types'

interface ProfileBookingsTabProps {
  isLoading: boolean
  isError: boolean
  bookings: Booking[] | undefined
  cancellingId: number | null
  onCancel: (bookingId: number) => void
}

export const ProfileBookingsTab = ({
  isLoading,
  isError,
  bookings,
  cancellingId,
  onCancel,
}: ProfileBookingsTabProps) => {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return <Alert severity="error">{t('bookings.loadFailed')}</Alert>
  }

  if (bookings && bookings.length === 0) {
    return <Alert severity="info">{t('bookings.empty')}</Alert>
  }

  if (!bookings || bookings.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'auto',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('bookings.colHotel')}</TableCell>
            <TableCell>{t('bookings.colRoom')}</TableCell>
            <TableCell>{t('bookings.colDates')}</TableCell>
            <TableCell>{t('bookings.colTotal')}</TableCell>
            <TableCell>{t('bookings.colStatus')}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{booking.room.hotel_name}</TableCell>
              <TableCell>{booking.room.number}</TableCell>
              <TableCell>
                {t('bookings.datesRow', {
                  checkIn: booking.check_in,
                  checkOut: booking.check_out,
                  nights: booking.nights,
                })}
              </TableCell>
              <TableCell>{booking.total_price} ₽</TableCell>
              <TableCell>{t(`enums.booking.${booking.status}`)}</TableCell>
              <TableCell align="right">
                {canCancelBooking(booking.status) ? (
                  <Button
                    disabled={cancellingId === booking.id}
                    onClick={() => void onCancel(booking.id)}
                    size="small"
                  >
                    {t('bookings.cancel')}
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
