import { Box } from '@mui/material'
import L from 'leaflet'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link as RouterLink } from 'react-router-dom'

import { fitHotelsBounds, resolveMapCenter } from '@entities/hotel/lib/mapBounds'
import type { HotelMapItem } from '@entities/hotel/model/map-types'

import 'leaflet/dist/leaflet.css'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface HotelsMapViewProps {
  hotels: HotelMapItem[]
  height?: number | string
  interactive?: boolean
  singleCenter?: [number, number]
}

const FitBounds = ({ hotels }: { hotels: HotelMapItem[] }) => {
  const map = useMap()

  useEffect(() => {
    fitHotelsBounds(map, hotels)
  }, [hotels, map])

  return null
}

export const HotelsMapView = ({
  hotels,
  height = 480,
  interactive = true,
  singleCenter,
}: HotelsMapViewProps) => {
  const { t } = useTranslation()
  const center = resolveMapCenter(hotels, singleCenter)

  return (
    <Box
      data-testid="hotels-map"
      sx={{ height, width: '100%', borderRadius: 1, overflow: 'hidden' }}
    >
      <MapContainer
        center={center}
        scrollWheelZoom={interactive}
        style={{ height: '100%', width: '100%' }}
        zoom={11}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotels.length > 1 ? <FitBounds hotels={hotels} /> : null}
        {hotels.map((hotel) => (
          <Marker
            key={hotel.id}
            position={[Number(hotel.latitude), Number(hotel.longitude)]}
          >
            <Popup>
              <RouterLink to={`/hotels/${hotel.id}`}>{hotel.name}</RouterLink>
              {hotel.min_price ? <div>{t('common.fromPrice', { price: hotel.min_price })}</div> : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  )
}
