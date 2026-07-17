import type {
  LoginRequest,
  RegisterRequest,
  TokenPair,
  User,
} from '../types/auth'
import { apiClient } from './client'

const withAuthorization = (accessToken: string) => ({
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
})

export const register = async (
  data: RegisterRequest,
): Promise<TokenPair> => {
  const response = await apiClient.post<TokenPair>('/auth/register', data)

  return response.data
}

export const login = async (data: LoginRequest): Promise<TokenPair> => {
  const response = await apiClient.post<TokenPair>('/auth/login', data)

  return response.data
}

export const refresh = async (refreshToken: string): Promise<TokenPair> => {
  const response = await apiClient.post<TokenPair>('/auth/refresh', {
    refresh_token: refreshToken,
  })

  return response.data
}

export const logout = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  await apiClient.post(
    '/auth/logout',
    { refresh_token: refreshToken },
    withAuthorization(accessToken),
  )
}

export const getCurrentUser = async (accessToken: string): Promise<User> => {
  const response = await apiClient.get<User>(
    '/auth/me',
    withAuthorization(accessToken),
  )

  return response.data
}
