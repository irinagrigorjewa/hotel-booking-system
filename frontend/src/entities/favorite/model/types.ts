export interface FavoriteCreated {
  hotel_id: number
  user_id: number
  created_at: string
}

export interface FavoriteListParams {
  page?: number
  size?: number
}
