import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

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
}: HotelMiniMapProps) => {
  const { t } = useTranslation()

  return (
    <>
      <Typography component="h2" gutterBottom sx={{ mt: 2 }} variant="h6">
        {t('common.onMap')}
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
}
