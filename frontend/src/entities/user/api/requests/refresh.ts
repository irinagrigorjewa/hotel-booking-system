import { apiClient } from '@shared/api/client'

import type { TokenPair } from '../../model/auth-types'

export const refresh = async (refreshToken: string): Promise<TokenPair> => {
  const response = await apiClient.post<TokenPair>('/auth/refresh', {
    refresh_token: refreshToken,
  })

  return response.data
}
