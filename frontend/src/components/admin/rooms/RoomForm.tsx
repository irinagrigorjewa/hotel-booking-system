import { Box, MenuItem, TextField } from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { AdminFormActions } from '../shared/AdminFormActions'
import { AdminFormError } from '../shared/AdminFormError'
import type { HotelListItem } from '../../../types/hotel'
import type { Room, RoomStatus, RoomWritePayload } from '../../../types/room'
import type { RoomType } from '../../../types/roomType'

interface RoomFormValues {
  hotel_id: number
  room_type_id: number
  number: string
  price: number
  capacity: number
  description: string
  status: RoomStatus
}

interface RoomFormProps {
  hotels: HotelListItem[]
  roomTypes: RoomType[]
  initialRoom?: Room | null
  isSubmitting: boolean
  submitError?: string
  onSubmit: (values: RoomWritePayload) => Promise<void>
  onCancel?: () => void
}

const emptyValues = (
  hotels: HotelListItem[],
  roomTypes: RoomType[],
): RoomFormValues => ({
  hotel_id: hotels[0]?.id ?? 0,
  room_type_id: roomTypes[0]?.id ?? 0,
  number: '',
  price: 1000,
  capacity: 2,
  description: '',
  status: 'AVAILABLE',
})

const toFormValues = (
  room: Room | null | undefined,
  hotels: HotelListItem[],
  roomTypes: RoomType[],
): RoomFormValues => {
  if (!room) {
    return emptyValues(hotels, roomTypes)
  }

  return {
    hotel_id: room.hotel_id,
    room_type_id: room.room_type_id,
    number: room.number,
    price: Number(room.price),
    capacity: room.capacity,
    description: room.description ?? '',
    status: room.status,
  }
}

export const RoomForm = ({
  hotels,
  roomTypes,
  initialRoom,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: RoomFormProps) => {
  const { t } = useTranslation()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormValues>({
    defaultValues: toFormValues(initialRoom, hotels, roomTypes),
  })

  useEffect(() => {
    reset(toFormValues(initialRoom, hotels, roomTypes))
  }, [hotels, initialRoom, reset, roomTypes])

  const submit = async (values: RoomFormValues): Promise<void> => {
    await onSubmit({
      hotel_id: Number(values.hotel_id),
      room_type_id: Number(values.room_type_id),
      number: values.number.trim(),
      price: Number(values.price),
      capacity: Number(values.capacity),
      description: values.description.trim() || null,
      status: values.status,
    })

    if (!initialRoom) {
      reset(emptyValues(hotels, roomTypes))
    }
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
      <AdminFormError message={submitError} />
      <Controller
        control={control}
        name="hotel_id"
        rules={{
          required: t('admin.form.hotelRequired'),
          min: { value: 1, message: t('admin.form.hotelRequired') },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            error={Boolean(errors.hotel_id)}
            fullWidth
            helperText={errors.hotel_id?.message}
            label={t('admin.nav.hotels')}
            margin="normal"
            onChange={(event) => field.onChange(Number(event.target.value))}
            select
            value={field.value || ''}
          >
            {hotels.map((hotel) => (
              <MenuItem key={hotel.id} value={hotel.id}>
                {hotel.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <Controller
        control={control}
        name="room_type_id"
        rules={{
          required: t('admin.form.roomTypeRequired'),
          min: { value: 1, message: t('admin.form.roomTypeRequired') },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            error={Boolean(errors.room_type_id)}
            fullWidth
            helperText={errors.room_type_id?.message}
            label={t('admin.form.roomTypeLabel')}
            margin="normal"
            onChange={(event) => field.onChange(Number(event.target.value))}
            select
            value={field.value || ''}
          >
            {roomTypes.map((roomType) => (
              <MenuItem key={roomType.id} value={roomType.id}>
                {roomType.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <TextField
        error={Boolean(errors.number)}
        fullWidth
        helperText={errors.number?.message}
        label={t('admin.colNumber')}
        margin="normal"
        {...register('number', { required: t('admin.form.numberRequired') })}
      />
      <TextField
        error={Boolean(errors.price)}
        fullWidth
        helperText={errors.price?.message}
        label={t('common.price')}
        margin="normal"
        type="number"
        {...register('price', {
          required: t('admin.form.priceRequired'),
          valueAsNumber: true,
          min: { value: 0.01, message: t('admin.form.priceMin') },
        })}
      />
      <TextField
        error={Boolean(errors.capacity)}
        fullWidth
        helperText={errors.capacity?.message}
        label={t('hotels.capacity')}
        margin="normal"
        type="number"
        {...register('capacity', {
          required: t('admin.form.capacityRequired'),
          valueAsNumber: true,
          min: { value: 1, message: t('admin.form.capacityMin') },
        })}
      />
      <TextField
        fullWidth
        label={t('common.description')}
        margin="normal"
        multiline
        minRows={2}
        {...register('description')}
      />
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <TextField {...field} fullWidth label={t('admin.colStatus')} margin="normal" select>
            <MenuItem value="AVAILABLE">{t('admin.form.statusAvailable')}</MenuItem>
            <MenuItem value="MAINTENANCE">{t('admin.form.statusMaintenance')}</MenuItem>
          </TextField>
        )}
      />
      <AdminFormActions
        cancelLabel={t('common.cancel')}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        submitLabel={initialRoom ? t('common.save') : t('common.create')}
      />
    </Box>
  )
}
