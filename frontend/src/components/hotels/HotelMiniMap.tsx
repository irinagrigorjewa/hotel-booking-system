import { Typography } from '@mui/material'

import { HotelsMapView } from './HotelsMapView'

interface HotelMiniMapProps {
  hotelId: number
  name: string
  latitude: string
  longitude: string
}

export const HotelMiniMap = ({
  hotelId,
  name,
  latitude,
  longitude,
}: HotelMiniMapProps) => (
  <>
    <Typography component="h2" gutterBottom sx={{ mt: 2 }} variant="h6">
      На карте
    </Typography>
    <HotelsMapView
      height={240}
      hotels={[
        {
          id: hotelId,
          name,
          latitude,
          longitude,
          stars: 0,
          min_price: null,
          avg_rating: null,
        },
      ]}
      interactive={false}
      singleCenter={[Number(latitude), Number(longitude)]}
    />
  </>
)
