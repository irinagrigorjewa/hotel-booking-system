import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useNotify } from '@app/providers/NotificationProvider'
import { useHotels } from '@entities/hotel/api/queries/useHotels'
import { useReviewMutations } from '@entities/review/api/mutations/useReviewMutations'
import { useReviews } from '@entities/review/api/queries/useReviews'

import { AdminErrorAlert } from '../components/admin/shared/AdminErrorAlert'
import { AdminPageHeader } from '../components/admin/shared/AdminPageHeader'

export const AdminReviewsPage = () => {
  const { t } = useTranslation()
  const { notifySuccess, notifyApiError } = useNotify()
  const hotelsQuery = useHotels({ page: 1, size: 100, sort: 'created_at' })
  const [hotelId, setHotelId] = useState<number | ''>('')
  const selectedHotelId = typeof hotelId === 'number' ? hotelId : 0
  const reviewsQuery = useReviews(selectedHotelId, {
    page: 1,
    size: 50,
  })
  const { deleteReview } = useReviewMutations(selectedHotelId)

  const handleDelete = async (reviewId: number): Promise<void> => {
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
    <Box>
      <AdminPageHeader
        links={[{ label: t('admin.back'), to: '/admin' }]}
        title={t('admin.reviewsTitle')}
      />
      <FormControl size="small" sx={{ mb: 2, minWidth: 260 }}>
        <InputLabel id="admin-review-hotel">{t('bookings.colHotel')}</InputLabel>
        <Select
          label={t('bookings.colHotel')}
          labelId="admin-review-hotel"
          onChange={(event) => {
            const value = event.target.value
            setHotelId(value === '' ? '' : Number(value))
          }}
          value={hotelId === '' ? '' : String(hotelId)}
        >
          <MenuItem value="">{t('admin.selectHotel')}</MenuItem>
          {(hotelsQuery.data?.items ?? []).map((hotel) => (
            <MenuItem key={hotel.id} value={String(hotel.id)}>
              {hotel.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {typeof hotelId !== 'number' ? (
        <Alert severity="info">{t('admin.selectHotelHint')}</Alert>
      ) : null}
      {typeof hotelId === 'number' && reviewsQuery.isError ? (
        <AdminErrorAlert
          message={t('reviews.loadFailed')}
          onRetry={() => {
            void reviewsQuery.refetch()
          }}
          retryLabel={t('common.retry')}
        />
      ) : null}
      {typeof hotelId === 'number' ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('auth.name')}</TableCell>
              <TableCell>{t('reviews.rating')}</TableCell>
              <TableCell>{t('reviews.comment')}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {(reviewsQuery.data?.items ?? []).map((review) => (
              <TableRow key={review.id}>
                <TableCell>{review.user_name}</TableCell>
                <TableCell>{review.rating}</TableCell>
                <TableCell>{review.comment}</TableCell>
                <TableCell align="right">
                  <Button
                    color="error"
                    onClick={() => void handleDelete(review.id)}
                    size="small"
                  >
                    {t('common.delete')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </Box>
  )
}
