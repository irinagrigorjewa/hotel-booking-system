import { Box, MenuItem, TextField } from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { STAR_OPTIONS } from '@shared/config/domainOptions'
import type { HotelListItem, HotelWritePayload } from '../../../types/hotel'
import { AdminFormActions } from '../shared/AdminFormActions'
import { AdminFormError } from '../shared/AdminFormError'

export interface HotelFormValues {
  name: string
  city: string
  address: string
  description: string
  stars: number
  latitude: number
  longitude: number
}

interface HotelFormProps {
  initialHotel?: HotelListItem | null
  isSubmitting: boolean
  submitError?: string
  onSubmit: (values: HotelWritePayload) => Promise<void>
  onCancel?: () => void
}

const emptyValues = (): HotelFormValues => ({
  name: '',
  city: '',
  address: '',
  description: '',
  stars: 3,
  latitude: 55.75,
  longitude: 37.61,
})

const toFormValues = (hotel?: HotelListItem | null): HotelFormValues => {
  if (!hotel) {
    return emptyValues()
  }

  return {
    name: hotel.name,
    city: hotel.city,
    address: hotel.address,
    description: hotel.description ?? '',
    stars: hotel.stars,
    latitude: Number(hotel.latitude),
    longitude: Number(hotel.longitude),
  }
}

export const HotelForm = ({
  initialHotel,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: HotelFormProps) => {
  const { t } = useTranslation()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HotelFormValues>({
    defaultValues: toFormValues(initialHotel),
  })

  useEffect(() => {
    reset(toFormValues(initialHotel))
  }, [initialHotel, reset])

  const submit = async (values: HotelFormValues): Promise<void> => {
    await onSubmit({
      name: values.name.trim(),
      city: values.city.trim(),
      address: values.address.trim(),
      description: values.description.trim() || null,
      stars: Number(values.stars),
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
    })

    if (!initialHotel) {
      reset(emptyValues())
    }
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
      <AdminFormError message={submitError} />
      <TextField
        error={Boolean(errors.name)}
        fullWidth
        helperText={errors.name?.message}
        label={t('common.name')}
        margin="normal"
        {...register('name', { required: t('admin.form.nameRequired') })}
      />
      <TextField
        error={Boolean(errors.city)}
        fullWidth
        helperText={errors.city?.message}
        label={t('common.city')}
        margin="normal"
        {...register('city', { required: t('admin.form.cityRequired') })}
      />
      <TextField
        error={Boolean(errors.address)}
        fullWidth
        helperText={errors.address?.message}
        label={t('common.address')}
        margin="normal"
        {...register('address', { required: t('admin.form.addressRequired') })}
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
        name="stars"
        rules={{
          required: t('admin.form.starsRequired'),
          min: { value: 1, message: t('admin.form.starsMin') },
          max: { value: 5, message: t('admin.form.starsMax') },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            error={Boolean(errors.stars)}
            fullWidth
            helperText={errors.stars?.message}
            label={t('common.stars')}
            margin="normal"
            onChange={(event) => field.onChange(Number(event.target.value))}
            select
            value={field.value}
          >
            {STAR_OPTIONS.map((star) => (
              <MenuItem key={star} value={star}>
                {star}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <TextField
        error={Boolean(errors.latitude)}
        fullWidth
        helperText={errors.latitude?.message}
        inputProps={{ step: 'any' }}
        label={t('admin.form.latitude')}
        margin="normal"
        type="number"
        {...register('latitude', {
          required: t('admin.form.latitudeRequired'),
          valueAsNumber: true,
          min: { value: -90, message: t('admin.form.latitudeRange') },
          max: { value: 90, message: t('admin.form.latitudeRange') },
        })}
      />
      <TextField
        error={Boolean(errors.longitude)}
        fullWidth
        helperText={errors.longitude?.message}
        inputProps={{ step: 'any' }}
        label={t('admin.form.longitude')}
        margin="normal"
        type="number"
        {...register('longitude', {
          required: t('admin.form.longitudeRequired'),
          valueAsNumber: true,
          min: { value: -180, message: t('admin.form.longitudeRange') },
          max: { value: 180, message: t('admin.form.longitudeRange') },
        })}
      />
      <AdminFormActions
        cancelLabel={t('common.cancel')}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        submitLabel={initialHotel ? t('common.save') : t('common.create')}
      />
    </Box>
  )
}
