import type { Room } from '../model/types'

export const buildBookPath = (
  room: Room,
  dateFrom?: string,
  dateTo?: string,
): string => {
  const params = new URLSearchParams({
    room_id: String(room.id),
    hotel_id: String(room.hotel_id),
  })
  if (dateFrom) {
    params.set('date_from', dateFrom)
  }
  if (dateTo) {
    params.set('date_to', dateTo)
  }

  return `/bookings/new?${params.toString()}`
}
