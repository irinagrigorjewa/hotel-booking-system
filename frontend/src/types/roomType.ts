export interface RoomType {
  id: number
  name: string
}

export interface RoomTypePage {
  items: RoomType[]
  total: number
  page: number
  size: number
}

export interface RoomTypeWritePayload {
  name: string
}
