export type RoomStatus = 'AVAILABLE' | 'MAINTENANCE'

export interface RoomTypeSummary {
  id: number
  name: string
}

export interface RoomHotelSummary {
  id: number
  name: string
  city: string
}

export interface RoomImage {
  id: number
  url: string
  sort_order: number
}

export interface Room {
  id: number
  hotel_id: number
  room_type_id: number
  number: string
  price: string
  capacity: number
  description: string | null
  status: RoomStatus
  room_type: RoomTypeSummary
  hotel: RoomHotelSummary
  images: RoomImage[]
}

export interface RoomPage {
  items: Room[]
  total: number
  page: number
  size: number
}

export interface RoomListParams {
  hotel_id?: number
  city?: string
  capacity?: number
  price_from?: number
  price_to?: number
  date_from?: string
  date_to?: string
  page?: number
  size?: number
}

export interface RoomWritePayload {
  hotel_id: number
  room_type_id: number
  number: string
  price: number
  capacity: number
  description?: string | null
  status: RoomStatus
}
