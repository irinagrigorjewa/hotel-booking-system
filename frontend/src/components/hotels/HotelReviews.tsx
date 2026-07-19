import {
  Alert,
  Box,
  Button,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useReviewMutations } from '../../hooks/useReviewMutations'
import { useReviews } from '../../hooks/useReviews'
import { getApiErrorMessage } from '../../utils/getApiErrorMessage'

interface HotelReviewsProps {
  hotelId: number
}

interface ReviewFormValues {
  rating: number
  comment: string
}

export const HotelReviews = ({ hotelId }: HotelReviewsProps) => {
  const { user } = useAuth()
  const reviewsQuery = useReviews(hotelId)
  const { createReview, deleteReview } = useReviewMutations(hotelId)
  const [formError, setFormError] = useState('')
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
    setFormError('')

    try {
      await createReview.mutateAsync(values)
      reset({ rating: 5, comment: '' })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Не удалось сохранить отзыв'))
    }
  }

  const remove = async (reviewId: number): Promise<void> => {
    if (!window.confirm('Удалить отзыв?')) {
      return
    }

    try {
      await deleteReview.mutateAsync(reviewId)
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Не удалось удалить отзыв'))
    }
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography component="h2" gutterBottom variant="h5">
        Отзывы
      </Typography>
      {formError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      ) : null}
      {reviewsQuery.isLoading ? (
        <Typography color="text.secondary">Загрузка отзывов…</Typography>
      ) : null}
      {reviewsQuery.isError ? (
        <Alert severity="error">Не удалось загрузить отзывы</Alert>
      ) : null}
      {reviewsQuery.data?.items.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Пока нет отзывов
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
                Удалить
              </Button>
            ) : null}
          </Box>
        ))}
      </Stack>
      {user ? (
        <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
          <Typography gutterBottom variant="subtitle1">
            Оставить отзыв
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
            label="Комментарий"
            multiline
            minRows={3}
            {...register('comment', {
              required: 'Напишите комментарий',
              minLength: { value: 10, message: 'Минимум 10 символов' },
              maxLength: { value: 2000, message: 'Максимум 2000 символов' },
            })}
          />
          <Button
            disabled={isSubmitting || createReview.isPending}
            sx={{ mt: 2 }}
            type="submit"
            variant="contained"
          >
            Отправить
          </Button>
        </Box>
      ) : (
        <Alert severity="info">
          <Button component={RouterLink} size="small" to="/login">
            Войдите
          </Button>
          , чтобы оставить отзыв
        </Alert>
      )}
    </Box>
  )
}
