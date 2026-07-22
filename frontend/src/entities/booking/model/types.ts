export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface BookingRoomSummary {
  id: number
  number: string
  price: string
  hotel_id: number
  hotel_name: string
}

export interface BookingUserSummary {
  id: number
  name: string
  email: string
}

export interface Booking {
  id: number
  user_id: number
  room_id: number
  check_in: string
  check_out: string
  nights: number
  total_price: string
  status: BookingStatus
  created_at: string
  room: BookingRoomSummary
  user: BookingUserSummary | null
}

export interface BookingPage {
  items: Booking[]
  total: number
  page: number
  size: number
}

export interface BookingListParams {
  status?: BookingStatus
  page?: number
  size?: number
}

export interface BookingCreatePayload {
  room_id: number
  check_in: string
  check_out: string
}
