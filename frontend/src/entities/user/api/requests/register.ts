import { apiClient } from '@shared/api/client'

import type { RegisterRequest, TokenPair } from '../../model/auth-types'

export const register = async (data: RegisterRequest): Promise<TokenPair> => {
  const response = await apiClient.post<TokenPair>('/auth/register', data)

  return response.data
}
