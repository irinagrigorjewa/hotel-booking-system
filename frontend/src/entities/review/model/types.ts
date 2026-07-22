export interface Review {
  id: number
  hotel_id: number
  user_id: number
  user_name: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

export interface ReviewPage {
  items: Review[]
  total: number
  page: number
  size: number
}

export interface ReviewWritePayload {
  rating: number
  comment: string
}

export interface ReviewListParams {
  page?: number
  size?: number
  order?: 'asc' | 'desc'
}
