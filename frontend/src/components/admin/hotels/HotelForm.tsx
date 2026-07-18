import { Alert, Box, Button, MenuItem, TextField } from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import type { HotelListItem, HotelWritePayload } from '../../../types/hotel'

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
      {submitError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      ) : null}
      <TextField
        error={Boolean(errors.name)}
        fullWidth
        helperText={errors.name?.message}
        label="Название"
        margin="normal"
        {...register('name', { required: 'Укажите название' })}
      />
      <TextField
        error={Boolean(errors.city)}
        fullWidth
        helperText={errors.city?.message}
        label="Город"
        margin="normal"
        {...register('city', { required: 'Укажите город' })}
      />
      <TextField
        error={Boolean(errors.address)}
        fullWidth
        helperText={errors.address?.message}
        label="Адрес"
        margin="normal"
        {...register('address', { required: 'Укажите адрес' })}
      />
      <TextField
        fullWidth
        label="Описание"
        margin="normal"
        multiline
        minRows={2}
        {...register('description')}
      />
      <Controller
        control={control}
        name="stars"
        rules={{
          required: 'Укажите звёзды',
          min: { value: 1, message: 'Минимум 1 звезда' },
          max: { value: 5, message: 'Максимум 5 звёзд' },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            error={Boolean(errors.stars)}
            fullWidth
            helperText={errors.stars?.message}
            label="Звёзды"
            margin="normal"
            onChange={(event) => field.onChange(Number(event.target.value))}
            select
            value={field.value}
          >
            {[1, 2, 3, 4, 5].map((star) => (
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
        label="Широта"
        margin="normal"
        type="number"
        {...register('latitude', {
          required: 'Укажите широту',
          valueAsNumber: true,
          min: { value: -90, message: 'Широта от −90 до 90' },
          max: { value: 90, message: 'Широта от −90 до 90' },
        })}
      />
      <TextField
        error={Boolean(errors.longitude)}
        fullWidth
        helperText={errors.longitude?.message}
        inputProps={{ step: 'any' }}
        label="Долгота"
        margin="normal"
        type="number"
        {...register('longitude', {
          required: 'Укажите долготу',
          valueAsNumber: true,
          min: { value: -180, message: 'Долгота от −180 до 180' },
          max: { value: 180, message: 'Долгота от −180 до 180' },
        })}
      />
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button disabled={isSubmitting} type="submit" variant="contained">
          {initialHotel ? 'Сохранить' : 'Создать'}
        </Button>
        {onCancel ? (
          <Button disabled={isSubmitting} onClick={onCancel} type="button">
            Отмена
          </Button>
        ) : null}
      </Box>
    </Box>
  )
}
