export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  name: string
  phone?: string | null
}
