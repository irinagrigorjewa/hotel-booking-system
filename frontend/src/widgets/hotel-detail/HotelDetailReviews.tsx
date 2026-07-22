import { HotelReviews } from '@features/review-create/ui/HotelReviews'

interface HotelDetailReviewsProps {
  hotelId: number
}

export const HotelDetailReviews = ({ hotelId }: HotelDetailReviewsProps) => (
  <HotelReviews hotelId={hotelId} />
)
