import { Box } from '@mui/material'
import L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link as RouterLink } from 'react-router-dom'

import type { HotelMapItem } from '../../types/hotelMap'

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
    if (hotels.length === 0) {
      return
    }

    const bounds = L.latLngBounds(
      hotels.map((hotel) => [Number(hotel.latitude), Number(hotel.longitude)]),
    )
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 })
  }, [hotels, map])

  return null
}

export const HotelsMapView = ({
  hotels,
  height = 480,
  interactive = true,
  singleCenter,
}: HotelsMapViewProps) => {
  const center: [number, number] =
    singleCenter ??
    (hotels[0]
      ? [Number(hotels[0].latitude), Number(hotels[0].longitude)]
      : [55.75, 37.62])

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
              {hotel.min_price ? <div>от {hotel.min_price} ₽</div> : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  )
}
