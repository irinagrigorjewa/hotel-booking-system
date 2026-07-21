import { HotelReviews } from '../../components/hotels/HotelReviews'

interface HotelDetailReviewsProps {
  hotelId: number
}

export const HotelDetailReviews = ({ hotelId }: HotelDetailReviewsProps) => (
  <HotelReviews hotelId={hotelId} />
)
