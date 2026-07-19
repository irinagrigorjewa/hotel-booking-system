import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useBookingMutations } from '../hooks/useBookingMutations'
import { useRoom } from '../hooks/useRoom'
import { formatMoney, nightsBetween, utcTodayIso } from '../utils/bookingDates'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

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
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roomId = parseRoomId(searchParams.get('room_id'))
  const { data: room, isLoading, isError } = useRoom(roomId)
  const { createBooking } = useBookingMutations()
  const [submitError, setSubmitError] = useState('')
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
    return <Alert severity="warning">Выберите номер на странице отеля.</Alert>
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError || !room) {
    return <Alert severity="error">Не удалось загрузить номер.</Alert>
  }

  const submit = async (values: BookingFormValues): Promise<void> => {
    setSubmitError('')

    try {
      await createBooking.mutateAsync({
        room_id: roomId,
        check_in: values.check_in,
        check_out: values.check_out,
      })
      navigate('/profile?tab=bookings', { replace: true })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Не удалось создать бронирование'))
    }
  }

  return (
    <Box component="form" maxWidth={480} noValidate onSubmit={handleSubmit(submit)}>
      <Typography component="h1" gutterBottom variant="h4">
        Новое бронирование
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {room.hotel.name} · номер {room.number} · {room.price} ₽ / ночь
      </Typography>
      {submitError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      ) : null}
      <Stack spacing={2}>
        <TextField
          InputLabelProps={{ shrink: true }}
          error={Boolean(errors.check_in)}
          fullWidth
          helperText={errors.check_in?.message}
          label="Заезд"
          type="date"
          {...register('check_in', {
            required: 'Укажите дату заезда',
            validate: (value) =>
              value >= today || 'Дата заезда не может быть в прошлом',
          })}
        />
        <TextField
          InputLabelProps={{ shrink: true }}
          error={Boolean(errors.check_out)}
          fullWidth
          helperText={errors.check_out?.message}
          label="Выезд"
          type="date"
          {...register('check_out', {
            required: 'Укажите дату выезда',
            validate: (value, formValues) => {
              const count = nightsBetween(formValues.check_in, value)

              if (count < 1) {
                return 'Выезд должен быть позже заезда'
              }
              if (count > 30) {
                return 'Максимум 30 ночей'
              }

              return true
            },
          })}
        />
        <Typography>
          Ночей: {nights > 0 ? nights : '—'}
          {totalPreview ? ` · Итого: ${totalPreview} ₽` : ''}
        </Typography>
        <Button
          disabled={isSubmitting || createBooking.isPending}
          type="submit"
          variant="contained"
        >
          Забронировать
        </Button>
      </Stack>
    </Box>
  )
}
