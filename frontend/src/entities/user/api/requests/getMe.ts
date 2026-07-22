import { apiClient } from '@shared/api/client'

import type { User } from '../../model/types'

const withAuthorization = (accessToken: string) => ({
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
})

export const getMe = async (accessToken: string): Promise<User> => {
  const response = await apiClient.get<User>(
    '/auth/me',
    withAuthorization(accessToken),
  )

  return response.data
}
