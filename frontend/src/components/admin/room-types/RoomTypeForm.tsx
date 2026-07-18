import { Alert, Box, Button, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import type { RoomType } from '../../../types/roomType'

interface RoomTypeFormValues {
  name: string
}

interface RoomTypeFormProps {
  initialRoomType?: RoomType | null
  isSubmitting: boolean
  submitError?: string
  onSubmit: (name: string) => Promise<void>
  onCancel?: () => void
}

export const RoomTypeForm = ({
  initialRoomType,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: RoomTypeFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomTypeFormValues>({
    defaultValues: { name: initialRoomType?.name ?? '' },
  })

  useEffect(() => {
    reset({ name: initialRoomType?.name ?? '' })
  }, [initialRoomType, reset])

  const submit = async (values: RoomTypeFormValues): Promise<void> => {
    await onSubmit(values.name.trim())
    if (!initialRoomType) {
      reset({ name: '' })
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
        label="Название типа"
        margin="normal"
        {...register('name', { required: 'Укажите название' })}
      />
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button disabled={isSubmitting} type="submit" variant="contained">
          {initialRoomType ? 'Сохранить' : 'Создать'}
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
