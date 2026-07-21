import { Box, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { AdminFormActions } from '../shared/AdminFormActions'
import { AdminFormError } from '../shared/AdminFormError'
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
  const { t } = useTranslation()
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
      <AdminFormError message={submitError} />
      <TextField
        error={Boolean(errors.name)}
        fullWidth
        helperText={errors.name?.message}
        label={t('admin.form.typeName')}
        margin="normal"
        {...register('name', { required: t('admin.form.nameRequired') })}
      />
      <AdminFormActions
        cancelLabel={t('common.cancel')}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        submitLabel={initialRoomType ? t('common.save') : t('common.create')}
      />
    </Box>
  )
}
