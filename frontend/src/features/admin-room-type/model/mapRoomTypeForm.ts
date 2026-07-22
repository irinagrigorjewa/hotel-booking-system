import type { RoomType } from '@entities/room-type/model/types'

export interface RoomTypeFormValues {
  name: string
}

export const emptyRoomTypeFormValues = (): RoomTypeFormValues => ({
  name: '',
})

export const toRoomTypeFormValues = (
  roomType?: RoomType | null,
): RoomTypeFormValues => ({
  name: roomType?.name ?? '',
})
