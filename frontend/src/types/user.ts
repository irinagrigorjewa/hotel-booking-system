import type { User, UserRole } from './auth'

export interface UserPage {
  items: User[]
  total: number
  page: number
  size: number
}

export interface UserListParams {
  page?: number
  size?: number
  search?: string
}

export interface UserMeUpdatePayload {
  name?: string
  phone?: string | null
}

export interface UserUpdatePayload {
  name?: string
  phone?: string | null
  role?: UserRole
}
