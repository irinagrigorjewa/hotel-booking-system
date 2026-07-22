import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { HotelReviewList } from '@entities/hotel/ui/HotelReviewList'
import { ReviewForm } from '@features/review-create/ui/ReviewForm'

interface HotelReviewsProps {
  hotelId: number
}

/** Composer: entity list + review-create form (drop-in for widgets/tests). */
export const HotelReviews = ({ hotelId }: HotelReviewsProps) => {
  const { t } = useTranslation()

  return (
    <Box sx={{ mb: 4 }}>
      <Typography component="h2" gutterBottom variant="h5">
        {t('reviews.title')}
      </Typography>
      <HotelReviewList hotelId={hotelId} />
      <ReviewForm hotelId={hotelId} />
    </Box>
  )
}
