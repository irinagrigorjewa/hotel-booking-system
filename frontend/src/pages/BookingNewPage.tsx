import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useNotify } from '../context/NotificationContext'
import { useBookingMutations } from '../hooks/useBookingMutations'
import { useRoom } from '../hooks/useRoom'
import { formatMoney, nightsBetween, utcTodayIso } from '../utils/bookingDates'

interface BookingFormValues {
  check_in: string
  check_out: string
}

const parseRoomId = (value: string | null): number => {
  if (!value) {
    return 0
  }

  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

export const BookingNewPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { notifySuccess, notifyApiError } = useNotify()
  const [searchParams] = useSearchParams()
  const roomId = parseRoomId(searchParams.get('room_id'))
  const { data: room, isLoading, isError } = useRoom(roomId)
  const { createBooking } = useBookingMutations()
  const today = utcTodayIso()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    defaultValues: {
      check_in: searchParams.get('date_from') ?? '',
      check_out: searchParams.get('date_to') ?? '',
    },
  })

  const checkIn = watch('check_in')
  const checkOut = watch('check_out')
  const nights = nightsBetween(checkIn, checkOut)
  const totalPreview =
    room && nights >= 1 ? formatMoney(nights * Number(room.price)) : null

  if (!roomId) {
    return <Alert severity="warning">{t('bookings.selectRoom')}</Alert>
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError || !room) {
    return <Alert severity="error">{t('bookings.roomLoadFailed')}</Alert>
  }

  const submit = async (values: BookingFormValues): Promise<void> => {
    try {
      await createBooking.mutateAsync({
        room_id: roomId,
        check_in: values.check_in,
        check_out: values.check_out,
      })
      notifySuccess('notifications.bookingCreated')
      navigate('/profile?tab=bookings', { replace: true })
    } catch (error) {
      notifyApiError(error, 'errors.createBookingFailed')
    }
  }

  return (
    <Box component="form" maxWidth={480} noValidate onSubmit={handleSubmit(submit)}>
      <Typography component="h1" gutterBottom variant="h4">
        {t('bookings.newTitle')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {t('bookings.roomSummary', {
          hotel: room.hotel.name,
          number: room.number,
          price: room.price,
        })}
      </Typography>
      <Stack spacing={2}>
        <TextField
          InputLabelProps={{ shrink: true }}
          error={Boolean(errors.check_in)}
          fullWidth
          helperText={errors.check_in?.message}
          label={t('hotels.checkIn')}
          type="date"
          {...register('check_in', {
            required: t('bookings.checkInRequired'),
            validate: (value) => value >= today || t('bookings.checkInPast'),
          })}
        />
        <TextField
          InputLabelProps={{ shrink: true }}
          error={Boolean(errors.check_out)}
          fullWidth
          helperText={errors.check_out?.message}
          label={t('hotels.checkOut')}
          type="date"
          {...register('check_out', {
            required: t('bookings.checkOutRequired'),
            validate: (value, formValues) => {
              const count = nightsBetween(formValues.check_in, value)

              if (count < 1) {
                return t('bookings.checkOutAfter')
              }
              if (count > 30) {
                return t('bookings.maxNights')
              }

              return true
            },
          })}
        />
        <Typography>
          {nights > 0 && totalPreview
            ? t('bookings.nightsAndTotal', { nights, total: totalPreview })
            : t('bookings.nightsPlaceholder')}
        </Typography>
        <Button
          disabled={isSubmitting || createBooking.isPending}
          type="submit"
          variant="contained"
        >
          {t('bookings.submit')}
        </Button>
      </Stack>
    </Box>
  )
}
