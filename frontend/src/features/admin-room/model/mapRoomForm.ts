import type { HotelListItem } from '@entities/hotel/model/types'
import type { Room, RoomStatus, RoomWritePayload } from '@entities/room/model/types'
import type { RoomType } from '@entities/room-type/model/types'

export interface RoomFormValues {
  hotel_id: number
  room_type_id: number
  number: string
  price: number
  capacity: number
  description: string
  status: RoomStatus
}

export const emptyRoomFormValues = (
  hotels: HotelListItem[],
  roomTypes: RoomType[],
): RoomFormValues => ({
  hotel_id: hotels[0]?.id ?? 0,
  room_type_id: roomTypes[0]?.id ?? 0,
  number: '',
  price: 1000,
  capacity: 2,
  description: '',
  status: 'AVAILABLE',
})

export const toRoomFormValues = (
  room: Room | null | undefined,
  hotels: HotelListItem[],
  roomTypes: RoomType[],
): RoomFormValues => {
  if (!room) {
    return emptyRoomFormValues(hotels, roomTypes)
  }

  return {
    hotel_id: room.hotel_id,
    room_type_id: room.room_type_id,
    number: room.number,
    price: Number(room.price),
    capacity: room.capacity,
    description: room.description ?? '',
    status: room.status,
  }
}

export const roomFormValuesToPayload = (
  values: RoomFormValues,
): RoomWritePayload => ({
  hotel_id: Number(values.hotel_id),
  room_type_id: Number(values.room_type_id),
  number: values.number.trim(),
  price: Number(values.price),
  capacity: Number(values.capacity),
  description: values.description.trim() || null,
  status: values.status,
})
