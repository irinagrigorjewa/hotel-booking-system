import type { HotelListItem, HotelWritePayload } from '@entities/hotel/model/types'

export interface HotelFormValues {
  name: string
  city: string
  address: string
  description: string
  stars: number
  latitude: number
  longitude: number
}

export const emptyHotelFormValues = (): HotelFormValues => ({
  name: '',
  city: '',
  address: '',
  description: '',
  stars: 3,
  latitude: 55.75,
  longitude: 37.61,
})

export const toHotelFormValues = (
  hotel?: HotelListItem | null,
): HotelFormValues => {
  if (!hotel) {
    return emptyHotelFormValues()
  }

  return {
    name: hotel.name,
    city: hotel.city,
    address: hotel.address,
    description: hotel.description ?? '',
    stars: hotel.stars,
    latitude: Number(hotel.latitude),
    longitude: Number(hotel.longitude),
  }
}

export const hotelFormValuesToPayload = (
  values: HotelFormValues,
): HotelWritePayload => ({
  name: values.name.trim(),
  city: values.city.trim(),
  address: values.address.trim(),
  description: values.description.trim() || null,
  stars: Number(values.stars),
  latitude: Number(values.latitude),
  longitude: Number(values.longitude),
})
