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
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import { reviewsApi } from '../api/reviews'
import { useHotels } from '../hooks/useHotels'
import { useReviews } from '../hooks/useReviews'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export const AdminReviewsPage = () => {
  const { t } = useTranslation()
  const hotelsQuery = useHotels({ page: 1, size: 100, sort: 'created_at' })
  const [hotelId, setHotelId] = useState<number | ''>('')
  const selectedHotelId = typeof hotelId === 'number' ? hotelId : 0
  const reviewsQuery = useReviews(selectedHotelId, {
    page: 1,
    size: 50,
  })
  const [actionError, setActionError] = useState('')

  const handleDelete = async (reviewId: number): Promise<void> => {
    if (!window.confirm(t('reviews.deleteConfirm'))) {
      return
    }

    setActionError('')

    try {
      await reviewsApi.remove(reviewId)
      await reviewsQuery.refetch()
    } catch (error) {
      setActionError(getApiErrorMessage(error, t('errors.deleteReviewFailed')))
    }
  }

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        {t('admin.reviewsTitle')}
      </Typography>
      <Typography sx={{ mb: 2 }}>
        <Button component={RouterLink} to="/admin">
          {t('admin.back')}
        </Button>
      </Typography>
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
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      ) : null}
      {typeof hotelId !== 'number' ? (
        <Alert severity="info">{t('admin.selectHotelHint')}</Alert>
      ) : null}
      {typeof hotelId === 'number' && reviewsQuery.isError ? (
        <Alert severity="error">{t('reviews.loadFailed')}</Alert>
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
