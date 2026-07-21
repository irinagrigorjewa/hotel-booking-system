import {
  Alert,
  Box,
  Button,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useNotify } from '../../context/NotificationContext'
import { useReviewMutations } from '../../hooks/useReviewMutations'
import { useReviews } from '../../hooks/useReviews'

interface HotelReviewsProps {
  hotelId: number
}

interface ReviewFormValues {
  rating: number
  comment: string
}

export const HotelReviews = ({ hotelId }: HotelReviewsProps) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { notifySuccess, notifyApiError } = useNotify()
  const reviewsQuery = useReviews(hotelId)
  const { createReview, deleteReview } = useReviewMutations(hotelId)
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

  const submit = async (values: ReviewFormValues): Promise<void> => {
    try {
      await createReview.mutateAsync(values)
      reset({ rating: 5, comment: '' })
      notifySuccess('notifications.reviewCreated')
    } catch (error) {
      notifyApiError(error, 'errors.saveReviewFailed')
    }
  }

  const remove = async (reviewId: number): Promise<void> => {
    if (!window.confirm(t('reviews.deleteConfirm'))) {
      return
    }

    try {
      await deleteReview.mutateAsync(reviewId)
      notifySuccess('notifications.reviewDeleted')
    } catch (error) {
      notifyApiError(error, 'errors.deleteReviewFailed')
    }
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography component="h2" gutterBottom variant="h5">
        {t('reviews.title')}
      </Typography>
      {reviewsQuery.isLoading ? (
        <Typography color="text.secondary">{t('reviews.loading')}</Typography>
      ) : null}
      {reviewsQuery.isError ? (
        <Alert severity="error">{t('reviews.loadFailed')}</Alert>
      ) : null}
      {reviewsQuery.data?.items.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('reviews.empty')}
        </Typography>
      ) : null}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {reviewsQuery.data?.items.map((review) => (
          <Box key={review.id} sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
              <Typography fontWeight={600}>{review.user_name}</Typography>
              <Rating readOnly size="small" value={review.rating} />
            </Box>
            <Typography sx={{ mt: 0.5 }}>{review.comment}</Typography>
            {user?.id === review.user_id ? (
              <Button
                onClick={() => {
                  void remove(review.id)
                }}
                size="small"
                sx={{ mt: 0.5 }}
              >
                {t('common.delete')}
              </Button>
            ) : null}
          </Box>
        ))}
      </Stack>
      {user ? (
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
      ) : (
        <Alert severity="info">
          <Button component={RouterLink} size="small" to="/login">
            {t('nav.login')}
          </Button>
          {`, ${t('reviews.loginToReview')}`}
        </Alert>
      )}
    </Box>
  )
}
