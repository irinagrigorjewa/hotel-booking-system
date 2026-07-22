import { apiClient } from '@shared/api/client'

const withAuthorization = (accessToken: string) => ({
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
})

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
