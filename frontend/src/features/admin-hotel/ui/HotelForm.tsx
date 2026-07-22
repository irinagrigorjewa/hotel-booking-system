import { Box, MenuItem, TextField } from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import type { HotelListItem, HotelWritePayload } from '@entities/hotel/model/types'
import { STAR_OPTIONS } from '@shared/config/domainOptions'
import { AdminFormActions } from '@shared/ui/AdminFormActions'
import { AdminFormError } from '@shared/ui/AdminFormError'

import {
  emptyHotelFormValues,
  hotelFormValuesToPayload,
  toHotelFormValues,
  type HotelFormValues,
} from '../model/mapHotelForm'

interface HotelFormProps {
  initialHotel?: HotelListItem | null
  isSubmitting: boolean
  submitError?: string
  onSubmit: (values: HotelWritePayload) => Promise<void>
  onCancel?: () => void
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
    defaultValues: toHotelFormValues(initialHotel),
  })

  useEffect(() => {
    reset(toHotelFormValues(initialHotel))
  }, [initialHotel, reset])

  const submit = async (values: HotelFormValues): Promise<void> => {
    await onSubmit(hotelFormValuesToPayload(values))

    if (!initialHotel) {
      reset(emptyHotelFormValues())
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
