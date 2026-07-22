import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useNotify } from '@app/providers/NotificationProvider'
import { useBookingMutations } from '@entities/booking/api/mutations/useBookingMutations'
import { useRoom } from '@entities/room/api/queries/useRoom'
import { formatMoney, nightsBetween, utcTodayIso } from '@shared/lib/bookingDates'

import {
  parseRoomId,
  validateCheckIn,
  validateCheckOut,
} from '../lib/validateBookingDates'

export interface BookingFormValues {
  check_in: string
  check_out: string
}

export const useBookingForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { notifySuccess, notifyApiError } = useNotify()
  const [searchParams] = useSearchParams()
  const roomId = parseRoomId(searchParams.get('room_id'))
  const roomQuery = useRoom(roomId)
  const { createBooking } = useBookingMutations()
  const today = utcTodayIso()
  const form = useForm<BookingFormValues>({
    defaultValues: {
      check_in: searchParams.get('date_from') ?? '',
      check_out: searchParams.get('date_to') ?? '',
    },
  })

  const checkIn = form.watch('check_in')
  const checkOut = form.watch('check_out')
  const nights = nightsBetween(checkIn, checkOut)
  const room = roomQuery.data
  const totalPreview =
    room && nights >= 1 ? formatMoney(nights * Number(room.price)) : null

  const checkInRules = {
    required: t('bookings.checkInRequired'),
    validate: (value: string) =>
      validateCheckIn(value, today, t('bookings.checkInPast')),
  }

  const checkOutRules = {
    required: t('bookings.checkOutRequired'),
    validate: (value: string, formValues: BookingFormValues) =>
      validateCheckOut(formValues.check_in, value, {
        after: t('bookings.checkOutAfter'),
        maxNights: t('bookings.maxNights'),
      }),
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

  return {
    roomId,
    room,
    isLoading: roomQuery.isLoading,
    isError: roomQuery.isError,
    form,
    nights,
    totalPreview,
    checkInRules,
    checkOutRules,
    submit,
    isPending: createBooking.isPending,
  }
}
