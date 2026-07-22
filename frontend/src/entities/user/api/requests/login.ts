import { apiClient } from '@shared/api/client'

import type { LoginRequest } from '../../model/auth-types'
import type { TokenPair } from '../../model/auth-types'

export const login = async (data: LoginRequest): Promise<TokenPair> => {
  const response = await apiClient.post<TokenPair>('/auth/login', data)

  return response.data
}
