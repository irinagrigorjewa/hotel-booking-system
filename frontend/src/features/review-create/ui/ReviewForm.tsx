import {
  Alert,
  Box,
  Button,
  Rating,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import { useNotify } from '@app/providers/NotificationProvider'
import { useReviewMutations } from '@entities/review/api/mutations/useReviewMutations'
import { useAuth } from '@features/auth/ui/AuthContext'

interface ReviewFormProps {
  hotelId: number
}

interface ReviewFormValues {
  rating: number
  comment: string
}

export const ReviewForm = ({ hotelId }: ReviewFormProps) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { notifySuccess, notifyApiError } = useNotify()
  const { createReview } = useReviewMutations(hotelId)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    defaultValues: { rating: 5, comment: '' },
  })
  const rating = watch('rating')

  if (!user) {
    return (
      <Alert severity="info">
        <Button component={RouterLink} size="small" to="/login">
          {t('nav.login')}
        </Button>
        {`, ${t('reviews.loginToReview')}`}
      </Alert>
    )
  }

  const submit = async (values: ReviewFormValues): Promise<void> => {
    try {
      await createReview.mutateAsync(values)
      reset({ rating: 5, comment: '' })
      notifySuccess('notifications.reviewCreated')
    } catch (error) {
      notifyApiError(error, 'errors.saveReviewFailed')
    }
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
      <Typography gutterBottom variant="subtitle1">
        {t('reviews.leave')}
      </Typography>
      <Rating
        onChange={(_event, value) => {
          setValue('rating', value ?? 5, { shouldValidate: true })
        }}
        sx={{ mb: 1 }}
        value={rating}
      />
      <TextField
        error={Boolean(errors.comment)}
        fullWidth
        helperText={errors.comment?.message}
        label={t('reviews.comment')}
        multiline
        minRows={3}
        {...register('comment', {
          required: t('reviews.commentRequired'),
          minLength: { value: 10, message: t('reviews.commentMin') },
          maxLength: { value: 2000, message: t('reviews.commentMax') },
        })}
      />
      <Button
        disabled={isSubmitting || createReview.isPending}
        sx={{ mt: 2 }}
        type="submit"
        variant="contained"
      >
        {t('common.submit')}
      </Button>
    </Box>
  )
}
