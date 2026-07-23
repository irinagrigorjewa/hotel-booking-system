import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdminErrorAlert } from '@shared/ui/AdminErrorAlert'
import { AdminPageHeader } from '@shared/ui/AdminPageHeader'
import { BOOKING_STATUS_OPTIONS } from '@shared/config/domainOptions'
import { useNotify } from '@app/providers/NotificationProvider'
import { useBookingMutations } from '@entities/booking/api/mutations/useBookingMutations'
import { useBookings } from '@entities/booking/api/queries/useBookings'
import type { BookingStatus } from '@entities/booking/model/types'
import {
  ALLOWED_STATUS_TRANSITIONS,
  statusSelectOptions,
} from '@shared/lib/bookingStatusTransitions'

export const AdminBookingsPage = () => {
  const { t } = useTranslation()
  const { notifySuccess, notifyApiError } = useNotify()
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const bookingsQuery = useBookings({
    page: 1,
    size: 100,
    ...(statusFilter ? { status: statusFilter } : {}),
  })
  const { updateBookingStatus } = useBookingMutations()

  const handleStatusChange = async (
    bookingId: number,
    status: BookingStatus,
  ): Promise<void> => {
    try {
      await updateBookingStatus.mutateAsync({ bookingId, status })
      notifySuccess('notifications.bookingStatusUpdated')
    } catch (error) {
      notifyApiError(error, 'errors.updateBookingFailed')
    }
  }

  return (
    <Box>
      <AdminPageHeader title={t('admin.bookingsTitle')} />
      <FormControl size="small" sx={{ mb: 2, minWidth: 180 }}>
        <InputLabel id="booking-status-filter">{t('bookings.colStatus')}</InputLabel>
        <Select
          label={t('bookings.colStatus')}
          labelId="booking-status-filter"
          onChange={(event) => {
            setStatusFilter(event.target.value as BookingStatus | '')
          }}
          value={statusFilter}
        >
          <MenuItem value="">{t('common.all')}</MenuItem>
          {BOOKING_STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status}>
              {t(`enums.booking.${status}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {bookingsQuery.isError ? (
        <AdminErrorAlert
          message={t('bookings.loadFailed')}
          onRetry={() => {
            void bookingsQuery.refetch()
          }}
          retryLabel={t('common.retry')}
        />
      ) : null}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('admin.colUser')}</TableCell>
            <TableCell>{t('bookings.colHotel')}</TableCell>
            <TableCell>{t('bookings.colDates')}</TableCell>
            <TableCell>{t('bookings.colTotal')}</TableCell>
            <TableCell>{t('bookings.colStatus')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(bookingsQuery.data?.items ?? []).map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{booking.user?.email ?? booking.user_id}</TableCell>
              <TableCell>
                {booking.room.hotel_name} · {booking.room.number}
              </TableCell>
              <TableCell>
                {booking.check_in} → {booking.check_out}
              </TableCell>
              <TableCell>{booking.total_price} ₽</TableCell>
              <TableCell>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    disabled={
                      updateBookingStatus.isPending ||
                      ALLOWED_STATUS_TRANSITIONS[booking.status].length === 0
                    }
                    onChange={(event) => {
                      void handleStatusChange(
                        booking.id,
                        event.target.value as BookingStatus,
                      )
                    }}
                    value={booking.status}
                  >
                    {statusSelectOptions(booking.status).map((status) => (
                      <MenuItem key={status} value={status}>
                        {t(`enums.booking.${status}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
