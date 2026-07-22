import {
  Alert,
  Box,
  Button,
  Rating,
  Stack,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import { useNotify } from '@app/providers/NotificationProvider'
import { useReviewMutations } from '@entities/review/api/mutations/useReviewMutations'
import { useReviews } from '@entities/review/api/queries/useReviews'
import { useAuth } from '@features/auth/ui/AuthContext'

interface HotelReviewListProps {
  hotelId: number
}

export const HotelReviewList = ({ hotelId }: HotelReviewListProps) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { notifySuccess, notifyApiError } = useNotify()
  const reviewsQuery = useReviews(hotelId)
  const { deleteReview } = useReviewMutations(hotelId)

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
    <>
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
    </>
  )
}
