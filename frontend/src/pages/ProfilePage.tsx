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
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'

import { useNotify } from '@app/providers/NotificationProvider'
import { useBookingMutations } from '@entities/booking/api/mutations/useBookingMutations'
import { canCancelBooking } from '@entities/booking/model/rules'
import { useBookings } from '@entities/booking/api/queries/useBookings'
import { useUserMutations } from '@entities/user/api/mutations/useUserMutations'
import { useAuth } from '@features/auth/ui/AuthContext'

export const ProfilePage = () => {
  const { t } = useTranslation()
  const { notifySuccess, notifyApiError } = useNotify()
  const { user, applyUser } = useAuth()
  const [searchParams] = useSearchParams()
  const showBookings = searchParams.get('tab') !== 'account'
  const { data, isLoading, isError } = useBookings({ page: 1, size: 50 })
  const { cancelBooking } = useBookingMutations()
  const { patchMe } = useUserMutations()
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')

  const handleCancel = async (bookingId: number): Promise<void> => {
    if (!window.confirm(t('bookings.cancelConfirm'))) {
      return
    }

    setCancellingId(bookingId)

    try {
      await cancelBooking.mutateAsync(bookingId)
      notifySuccess('notifications.bookingCancelled')
    } catch (error) {
      notifyApiError(error, 'errors.cancelBookingFailed')
    } finally {
      setCancellingId(null)
    }
  }

  const handleSaveProfile = async (): Promise<void> => {
    try {
      const updated = await patchMe.mutateAsync({
        name: name.trim(),
        phone: phone.trim() ? phone.trim() : null,
      })
      applyUser(updated)
      notifySuccess('notifications.profileSaved')
    } catch (error) {
      notifyApiError(error, 'errors.saveProfileFailed')
    }
  }

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        {t('bookings.profileTitle')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {user?.name} · {user?.email}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button
          component={RouterLink}
          to="/profile?tab=account"
          variant={!showBookings ? 'contained' : 'outlined'}
        >
          {t('profile.tabAccount')}
        </Button>
        <Button
          component={RouterLink}
          to="/profile?tab=bookings"
          variant={showBookings ? 'contained' : 'outlined'}
        >
          {t('bookings.tab')}
        </Button>
      </Stack>
      {!showBookings ? (
        <Stack spacing={2} sx={{ maxWidth: 420 }}>
          <TextField
            InputProps={{ readOnly: true }}
            label={t('auth.email')}
            value={user?.email ?? ''}
          />
          <TextField
            label={t('auth.name')}
            onChange={(event) => {
              setName(event.target.value)
            }}
            value={name}
          />
          <TextField
            label={t('auth.phone')}
            onChange={(event) => {
              setPhone(event.target.value)
            }}
            value={phone}
          />
          <TextField
            InputProps={{ readOnly: true }}
            label={t('profile.role')}
            value={user?.role ? t(`enums.role.${user.role}`) : ''}
          />
          <Button
            disabled={patchMe.isPending || name.trim().length === 0}
            onClick={() => void handleSaveProfile()}
            variant="contained"
          >
            {t('profile.save')}
          </Button>
        </Stack>
      ) : null}
      {showBookings && isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : null}
      {showBookings && isError ? (
        <Alert severity="error">{t('bookings.loadFailed')}</Alert>
      ) : null}
      {showBookings && data && data.items.length === 0 ? (
        <Alert severity="info">{t('bookings.empty')}</Alert>
      ) : null}
      {showBookings && data && data.items.length > 0 ? (
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
            {data.items.map((booking) => (
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
                      onClick={() => void handleCancel(booking.id)}
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
      ) : null}
    </Box>
  )
}
